import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Search, Filter, GitCompare, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import ReportCard from "../components/ReportCard";
import ReportPreview from "../components/ReportPreview";
import ComparisonView from "../components/ComparisonView";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const { token, user } = useAuth();
  const location = useLocation();

  // Admin Context Selection
  const selectedBusinessId = location.state?.businessId;
  const selectedBusinessName = location.state?.businessName;

  // Selection for comparison
  const [selectedIds, setSelectedIds] = useState([]);

  // Preview Modal state
  const [previewId, setPreviewId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Comparison Modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareData, setCompareData] = useState({ r1: null, r2: null });
  const [comparePdfs, setComparePdfs] = useState({ p1: "", p2: "" });
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedBusinessId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let apiUrl = import.meta.env.VITE_API_URL || "";

      // If admin selected a business, filter by that ID
      let url = `${apiUrl}/api/reports`;
      if (selectedBusinessId) {
        url += `?businessId=${selectedBusinessId}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (id) => {
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/reports/summary/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Summary not found");
    return await res.json();
  };

  const handleView = async (id) => {
    // const report = reports.find(r => r.fileId === id); // Unused
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    setPreviewId(id);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewData(null);
    try {
      const data = await fetchSummary(id);
      setPreviewData(data);
    } catch (err) {
      console.error(err);
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };


  const handleSelectForCompare = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length < 2) return [...prev, id];
      return prev;
    });
  };

  const handleStartComparison = async () => {
    if (selectedIds.length !== 2) return;
    const r1 = reports.find(r => r.fileId === selectedIds[0]);
    const r2 = reports.find(r => r.fileId === selectedIds[1]);
    let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    setIsCompareOpen(true);
    setComparePdfs({
      p1: r1?.pdfPath ? `${apiUrl}/${r1.pdfPath}` : "",
      p2: r2?.pdfPath ? `${apiUrl}/${r2.pdfPath}` : ""
    });
    setCompareLoading(true);
    try {
      const [data1, data2] = await Promise.all([
        fetchSummary(selectedIds[0]),
        fetchSummary(selectedIds[1])
      ]);
      setCompareData({ r1: data1, r2: data2 });
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };


  const filteredReports = reports
    .filter(r =>
      r.millName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.week.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.5] opacity-20"
        style={{ backgroundImage: 'url("/bg-ai.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-white/40" />

      <div className="relative z-10 container max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-zinc-200">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-zinc-900 uppercase italic">
              {selectedBusinessName ? (
                <>
                  {selectedBusinessName} <span className="text-blue-600 not-italic">Archive</span>
                </>
              ) : (
                <>
                  Reports <span className="text-blue-600 not-italic">Archive</span>
                </>
              )}
            </h1>
            <p className="text-zinc-600 font-medium max-w-md">
              Manage and analyze all your generated executive summaries in one high-performance dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={() => setIsCompareOpen(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6 h-12 rounded-xl transition-all shadow-lg shadow-zinc-200"
            >
              <GitCompare className="mr-2 h-5 w-5" />
              Compare Reports
            </Button>

            {/* Hide New Analysis if Admin is viewing specific business read-only */}
            {!(user?.role === 'admin' && selectedBusinessId) && (
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white blue-glow px-8 h-12 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200">
                <Link
                  to="/spe"
                  state={user?.role === 'user' ? {
                    businessId: user?.businessId,
                    businessName: user?.business?.name
                  } : null}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  New Analysis
                </Link>
              </Button>
            )}
          </div>
        </div>


        {/* Toolbar Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search by mill name or week..."
              className="pl-12 h-14 bg-white border-zinc-200 rounded-2xl focus:ring-blue-500/20 text-zinc-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="h-5 w-5 text-zinc-600" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-14 w-[180px] bg-white border-zinc-200 rounded-2xl text-zinc-900">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-zinc-900">
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Section */}
        {
          loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-6 glass rounded-[2.5rem]">
              <div className="relative">
                <Loader2 className="h-14 w-14 animate-spin text-blue-500" />
                <div className="absolute inset-0 blur-xl bg-blue-500/30 animate-pulse"></div>
              </div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Cloud Data</p>
            </div>
          ) : error ? (
            <div className="box-glass p-20 rounded-[3rem] text-center space-y-8 border-red-500/10 max-w-2xl mx-auto">
              <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
                <Plus className="h-12 w-12 text-red-500 rotate-45" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Database Offline</h2>
                <p className="text-zinc-500 font-medium leading-relaxed">{error}</p>
              </div>
              <Button
                variant="outline"
                className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white px-10 h-12 rounded-xl"
                onClick={fetchReports}
              >
                System Reset
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.fileId}
                  report={report}
                  onView={handleView}
                />
              ))}

              {filteredReports.length === 0 && (
                <div className="col-span-full py-32 text-center glass rounded-[3rem] space-y-4">
                  <LayoutGrid className="h-16 w-16 text-zinc-300 mx-auto" />
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No reports found matching your criteria</p>
                </div>
              )}
            </div>
          )
        }
      </div >

      <ReportPreview
        isOpen={!!previewId}
        onClose={() => setPreviewId(null)}
        summary={previewData}
        setSummary={setPreviewData}
        fileId={previewId}
        loading={previewLoading}
        error={previewError}
        onUpdate={(updatedData) => {
          setPreviewData(updatedData);
          fetchReports(); // Refresh list to update metadata/timestamps
        }}
      />

      <ComparisonView
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        allReports={reports}
        onFetchReport={fetchSummary}
      />

    </main >
  );
}
