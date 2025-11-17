import { Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const SocialFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-6">
      <div className="flex justify-center items-center gap-6">
        <a 
          href="#" 
          className="hover:opacity-70 transition-opacity"
          aria-label="Twitter"
        >
          <Twitter className="w-6 h-6" />
        </a>
        <a 
          href="#" 
          className="hover:opacity-70 transition-opacity"
          aria-label="Instagram"
        >
          <Instagram className="w-6 h-6" />
        </a>
        <a 
          href="#" 
          className="hover:opacity-70 transition-opacity"
          aria-label="YouTube"
        >
          <Youtube className="w-6 h-6" />
        </a>
        <a 
          href="#" 
          className="hover:opacity-70 transition-opacity"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
};

export default SocialFooter;
