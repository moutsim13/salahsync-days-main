import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("Accessing placeholder for:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <span className="text-2xl">⏳</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          Coming Soon
        </h1>
        <p className="text-muted-foreground mb-8 max-w-[280px] mx-auto text-sm leading-relaxed">
          We're working hard to bring this feature to your Waqt experience. Stay tuned!
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
