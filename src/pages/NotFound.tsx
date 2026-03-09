import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Dumbbell } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="font-heading text-3xl gold-text">GymFlow</span>
        </div>
        <h1 className="mb-4 text-6xl font-heading gold-text">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="inline-block px-6 py-3 gold-gradient text-primary-foreground rounded-full font-accent hover:opacity-90 transition-opacity">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
