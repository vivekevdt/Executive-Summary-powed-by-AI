import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, Sparkles } from "lucide-react";

export default function Header() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const showHistory = !isDashboard && !isLoginPage;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">

        {/* LEFT: Logo + Title */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90"
        >
          <img
            src="https://www.zuariindustries.in/assets/web/img/logo/zuari_logo.png"
            alt="Zuari Logo"
            className="h-11 w-auto"
          />
          <img
            src="../public/GSMA-logo.png"
            alt="GSMA LOGO"
            className="h-15 w-auto"
          />
          <span className="hidden sm:block h-6 w-px bg-zinc-500" />


          <span className="hidden sm:block text-zinc-900 font-semibold text-base">
            Executive Portal
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {showHistory && (
            <Button
              asChild
              variant="ghost"
              className="text-zinc-600 "
            >
              <Link to="/spe/reports" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </Button>
          )}

          <img
            src="https://www.adventz.com/html/images/logo.png"
            alt="Zuari Logo"
            className="h-9 w-auto"
          />

        </div>

      </div>
    </header>
  );
}
