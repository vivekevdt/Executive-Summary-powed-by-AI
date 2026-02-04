import { useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  FileClock,
  Mail
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
              ? "border-blue-500/30 bg-blue-50 hover:bg-blue-100"
              : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100"
          )}
        >
          {file && progress === 100 ? (
            <div className="text-center space-y-2 animate-in fade-in duration-500">
              <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-zinc-900 font-medium text-sm max-w-[200px] truncate">{file.name}</p>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Click to change</span>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-200 transition-all duration-300">
                <UploadCloud className="h-7 w-7 text-zinc-400 group-hover:text-blue-600 transition-colors" />
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
  const [backendProgress, setBackendProgress] = useState(0);
  const [backendStatus, setBackendStatus] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const validateEmail = (email) => {
    // Basic regex for single or multiple comma-separated emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.split(',').every(e => emailRegex.test(e.trim()));
  };

  const isReady = currentWeek && previousWeek && recipientEmail && validateEmail(recipientEmail);

  const handleSubmit = async () => {
    if (!isReady) return;

    setLoading(true);
    setError("");
    setSuccess(false);
    setBackendProgress(0);
    setBackendStatus("Initializing...");

    const jobId = Math.random().toString(36).substring(2, 15);
    const formData = new FormData();
    formData.append("currentWeek", currentWeek);
    formData.append("previousWeek", previousWeek);
    formData.append("recipientEmail", recipientEmail);
    formData.append("jobId", jobId);

    // Polling function
    const pollStatus = async () => {
      try {
        let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const statusRes = await fetch(`${apiUrl}/api/reports/status/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (statusRes.ok) {
          const data = await statusRes.json();
          setBackendProgress(data.percent);
          setBackendStatus(data.status);
          return data.percent >= 100;
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
      return false;
    };

    const pollInterval = setInterval(async () => {
      const isDone = await pollStatus();
      if (isDone) clearInterval(pollInterval);
    }, 1500);

    try {
      let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${apiUrl}/api/reports/executive-summary`,
        {
          method: "POST",
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      clearInterval(pollInterval);

      if (!res.ok) throw new Error("Server error");

      await res.json();
      setSuccess(true);
      setCurrentWeek(null);
      setPreviousWeek(null);
      setRecipientEmail("");
      setBackendProgress(100);
      setBackendStatus("Report complete!");
    } catch (err) {
      clearInterval(pollInterval);
      setError(err.message);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-5xl mx-auto glass p-8 lg:p-12 rounded-[2rem] shadow-xl border border-zinc-200">
        <header className="text-center space-y-6 mb-12">
          <div className="mx-auto w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
            <Sparkles className="h-10 w-10 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-zinc-900 sm:text-6xl">
            SPE Executive <span className="text-blue-600">Summary</span>
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

        {/* Email Recipient Section */}
        <section className="mb-12 space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Recipient Email(s)
            </label>
            {recipientEmail && !validateEmail(recipientEmail) && (
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Invalid format</span>
            )}
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within:bg-blue-500/10 transition-all duration-500" />
            <Input
              type="text"
              placeholder="e.g. exec1@example.com, exec2@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={cn(
                "relative bg-white border-zinc-200 h-16 rounded-2xl px-6 text-lg focus:ring-2 focus:ring-blue-500/20 transition-all text-zinc-900 placeholder:text-zinc-400 shadow-sm",
                recipientEmail && !validateEmail(recipientEmail) && "border-red-500/50 bg-red-500/5"
              )}
            />
          </div>
          <p className="text-[11px] text-zinc-500 px-1 italic">
            Note: The report will be dispatched to this address upon completion.
          </p>
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
          <div className="relative group">
            {loading && (
              <div
                className="absolute top-0 left-0 h-full bg-blue-500/20 transition-all duration-1000 ease-out z-0 rounded-2xl"
                style={{ width: `${backendProgress}%` }}
              />
            )}
            <Button
              size="lg"
              className={cn(
                "w-full h-16 text-xl font-bold rounded-2xl transition-all duration-500 shadow-xl group overflow-hidden relative z-10",
                isReady && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] blue-glow"
                  : loading
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "bg-zinc-100 text-zinc-400 grayscale cursor-not-allowed border border-zinc-200"
              )}
              onClick={handleSubmit}
              disabled={!isReady || loading}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm uppercase tracking-widest font-black text-zinc-900">{backendProgress}% Complete</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 font-medium">{backendStatus}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  <span>Generate Executive Summary</span>
                </div>
              )}
            </Button>
          </div>


          <div className="text-center">
            <Badge variant="outline" className={cn(
              "px-4 py-1.5 rounded-full transition-colors border-zinc-200",
              isReady ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-zinc-50 text-zinc-400"
            )}>
              {isReady ? "Ready to analyze" : "Upload 2 files to enable AI"}
            </Badge>
          </div>

        </footer>
      </div>
    </div>
  );
}
