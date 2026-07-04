import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SplashPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/"), 1500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <img src="/logo.png" alt="KRIKSO India" className="h-28 w-auto animate-pulse" />
    </div>
  );
}

