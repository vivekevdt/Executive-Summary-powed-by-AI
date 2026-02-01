import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  FileClock
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- File Uploader ---------------- */

function FileUploader({ label, file, setFile, icon }) {
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setProgress(0);
    let value = 0;
    const interval = setInterval(() => {
      value += 10;
      setProgress(value);
      if (value >= 100) clearInterval(interval);
    }, 120);
  };

  return (
    <div className="group space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          {icon}
          {label}
        </label>
        {file && <span className="text-xs text-blue-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)}MB</span>}
      </div>

      <div className={cn(
        "relative rounded-2xl transition-all duration-300",
        file ? "glass-card p-1" : "p-1"
      )}>
        <input
          id={`file-${label}`}
          type="file"
          accept=".ppt,.pptx"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        <label
          htmlFor={`file-${label}`}
          className={cn(
            "flex flex-col items-center justify-center gap-4 w-full h-44 rounded-xl border-2 border-dashed transition-all cursor-pointer group",
            file
              ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/80"
          )}
        >
          {file && progress === 100 ? (
            <div className="text-center space-y-2 animate-in fade-in duration-500">
              <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-zinc-200 font-medium text-sm max-w-[200px] truncate">{file.name}</p>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Click to change</span>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-700 transition-all duration-300">
                <UploadCloud className="h-7 w-7 text-zinc-500 group-hover:text-blue-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-zinc-300 font-bold">Select Presentation</p>
                <p className="text-zinc-600 text-xs">PPT or PPTX up to 50MB</p>
              </div>
            </>
          )}
        </label>

        {progress > 0 && progress < 100 && (
          <div className="absolute inset-x-4 bottom-4 space-y-2">
            <Progress value={progress} className="h-1 bg-zinc-800" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Main Form ---------------- */

export default function ExecutiveSummaryForm() {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [previousWeek, setPreviousWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isReady = currentWeek && previousWeek;

  const handleSubmit = async () => {
    if (!isReady) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("currentWeek", currentWeek);
    formData.append("previousWeek", previousWeek);

    try {
      let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${apiUrl}/api/reports/executive-summary`,
        { method: "POST", body: formData }
      );
      

      if (!res.ok) throw new Error("Server error");

      await res.json();
      setSuccess(true);
      setCurrentWeek(null);
      setPreviousWeek(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-5xl mx-auto glass p-8 lg:p-12 rounded-[2rem] shadow-2xl border border-zinc-800/50">
        <header className="text-center space-y-6 mb-12">
          <div className="mx-auto w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
            <Sparkles className="h-10 w-10 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            SPE Executive <span className="text-blue-500">Summary</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Our AI engine analyzes your weekly PPT reports to highlight key changes, performance metrics, and strategic insights.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FileUploader
            label="Current Week"
            file={currentWeek}
            setFile={setCurrentWeek}
            icon={<FileText className="h-6 w-6" />}
          />
          <FileUploader
            label="Previous Week"
            file={previousWeek}
            setFile={setPreviousWeek}
            icon={<FileClock className="h-6 w-6" />}
          />
        </section>

        {/* Status Messages */}
        <div className="mb-8 empty:hidden">
          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <AlertTitle className="font-bold">Summary Dispatched!</AlertTitle>
              <AlertDescription className="text-emerald-400/80">
                The report has been successfully generated and sent to your email.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 animate-in shake duration-500">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Generation Failed</AlertTitle>
              <AlertDescription className="text-red-400/80">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <footer className="space-y-6">
          <Button
            size="lg"
            className={cn(
              "w-full h-16 text-xl font-bold rounded-2xl transition-all duration-500 shadow-2xl group overflow-hidden relative",
              isReady && !loading
                ? "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] blue-glow"
                : "bg-zinc-800 text-zinc-500 grayscale cursor-not-allowed border border-zinc-700"
            )}
            onClick={handleSubmit}
            disabled={!isReady || loading}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Processing Intelligence...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                <span>Generate Executive Summary</span>
              </div>
            )}
          </Button>

          <div className="text-center">
            <Badge variant="outline" className={cn(
              "px-4 py-1.5 rounded-full transition-colors border-zinc-800",
              isReady ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-900 text-zinc-600"
            )}>
              {isReady ? "Ready to analyze" : "Upload 2 files to enable AI"}
            </Badge>
          </div>
        </footer>
      </div>
    </div>
  );
}
