import { Heart } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <Heart className="h-6 w-6 text-primary fill-primary/20" />
          MedBuddy
        </a>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#upload" className="hover:text-foreground transition-colors hidden sm:block">Upload</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors hidden sm:block">How it works</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
