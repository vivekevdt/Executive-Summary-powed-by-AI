import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReportsTable from "../components/ReportsTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/reports`);


        if (!res.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await res.json();
        setReports(data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.5] opacity-20"
        style={{ backgroundImage: 'url("/bg-ai.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-zinc-950/80" />

      <div className="relative z-10 container max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-800/50">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white italic uppercase">
              Reports <span className="text-blue-500">History</span>
            </h1>
            <p className="text-zinc-400 font-medium">
              Access and manage your AI-generated executive insights.
            </p>
          </div>

          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white blue-glow px-6 py-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
            <Link to="/">
              <Plus className="mr-2 h-5 w-5" />
              Generate New Summary
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6 glass rounded-3xl">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="absolute inset-0 blur-lg bg-blue-500/20 animate-pulse"></div>
            </div>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Retrieving Database...</p>
          </div>
        ) : error ? (
          <div className="glass p-12 rounded-3xl text-center space-y-6 border-red-500/20">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <Plus className="h-8 w-8 text-red-500 rotate-45" />
            </div>
            <p className="text-red-400 font-bold text-xl">{error}</p>
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ReportsTable reports={reports} />
          </div>
        )}
      </div>
    </main>
  );
}
