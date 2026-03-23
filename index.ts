import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, age, language } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("prescriptions")
      .download(fileName);

    if (downloadError) {
      throw new Error("Failed to download file: " + downloadError.message);
    }

    // Convert file to base64 for AI processing (chunk to avoid stack overflow)
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    const langInstruction = language === "hindi"
      ? "Respond entirely in Hindi (Devanagari script)."
      : "Respond in simple English.";

    const ageContext = age ? `The patient is ${age} years old. Adjust explanations for age-appropriateness.` : "";

    const systemPrompt = `You are MedBuddy, a medical document simplifier. You MUST ONLY extract and simplify information that is EXPLICITLY written in the uploaded document. 

CRITICAL RULES:
- Extract medicine names, dosages, timing, and duration EXACTLY as written in the prescription
- Do NOT invent or guess any medication details
- Do NOT add medical advice or suggest alternatives
- Do NOT pull in outside information
- The medication table MUST match the prescription exactly
- If something is unclear in the document, say "as written in prescription" rather than guessing

${langInstruction}
${ageContext}

Return a JSON object with this EXACT structure:
{
  "diagnosis": "Plain-language explanation of the diagnosis/condition mentioned in the document, explained like talking to a friend",
  "medications": [
    {
      "name": "Medicine name EXACTLY as written in prescription",
      "dosage": "EXACT dosage from document",
      "timing": "EXACT timing/frequency from document",
      "days": "EXACT duration from document"
    }
  ],
  "sideEffects": [
    {
      "effect": "A common side effect to watch for based on the prescribed medicines",
      "whenToCall": false
    },
    {
      "effect": "A serious warning sign that requires immediate medical attention",
      "whenToCall": true
    }
  ],
  "followUp": [
    { "item": "Follow-up action from document", "done": false }
  ],
  "oneLiner": "One simple sentence summarizing everything the patient can share with family",
  "originalExcerpts": ["Key medical jargon excerpts copied verbatim from the original document"]
}

Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.`;

    // Build the message with the document
    const userContent: any[] = [
      { type: "text", text: "Read this medical document carefully and extract ALL information exactly as written. Do not make up any details. Here is the document:" },
    ];

    if (fileType.startsWith("image/")) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${fileType};base64,${base64}` },
      });
    } else {
      // For PDFs, send as image (many models handle PDF pages as images)
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${fileType};base64,${base64}` },
      });
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      throw new Error(`AI analysis failed (${response.status})`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || "";

    console.log("AI raw response length:", aiResponse.length);

    // Parse the AI response
    let parsed;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError.message, "Raw:", aiResponse.substring(0, 500));
      throw new Error("Failed to parse AI response. Please try again.");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
