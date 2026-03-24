import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, FileText } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-border glass sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 font-display font-bold text-lg">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-gradient">ATS Analyzer</span>
        </button>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
