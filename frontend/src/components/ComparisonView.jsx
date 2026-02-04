import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GitCompare, Loader2, FileSearch, ZoomIn, ZoomOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function ComparisonView({ isOpen, onClose, allReports, onFetchReport }) {
    const { token } = useAuth();
    const [selectedId1, setSelectedId1] = useState("");
    const [selectedId2, setSelectedId2] = useState("");
    const [data1, setData1] = useState(null);
    const [data2, setData2] = useState(null);
    const [pdfUrl1, setPdfUrl1] = useState("");
    const [pdfUrl2, setPdfUrl2] = useState("");
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [activeTab, setActiveTab] = useState("pdf");

    // Reset state when active tab changes or closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedId1("");
            setSelectedId2("");
            setData1(null);
            setData2(null);
            setPdfUrl1("");
            setPdfUrl2("");
            setZoom(1);
        }
    }, [isOpen]);

    // Cleanup Blob URLs
    useEffect(() => {
        return () => {
            if (pdfUrl1) URL.revokeObjectURL(pdfUrl1);
            if (pdfUrl2) URL.revokeObjectURL(pdfUrl2);
        };
    }, [pdfUrl1, pdfUrl2]);

    const fetchPdfBlob = async (fileId) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const filename = `${fileId}-executive-summary.pdf`;
            const res = await fetch(`${apiUrl}/api/reports/download/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch PDF");
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        } catch (err) {
            console.error("Error fetching PDF:", err);
            return "";
        }
    };

    const handleSelect1 = async (id) => {
        setSelectedId1(id);
        setLoading1(true);
        try {
            const data = await onFetchReport(id);
            setData1(data);
            const blobUrl = await fetchPdfBlob(id);
            setPdfUrl1(blobUrl);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading1(false);
        }
    };

    const handleSelect2 = async (id) => {
        setSelectedId2(id);
        setLoading2(true);
        try {
            const data = await onFetchReport(id);
            setData2(data);
            const blobUrl = await fetchPdfBlob(id);
            setPdfUrl2(blobUrl);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading2(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    if (!isOpen) return null;

    const renderContent = (data, loading, isPlaceholder, label) => {
        if (loading) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-full bg-zinc-50/50">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Data...</p>
                </div>
            );
        }

        if (!data || isPlaceholder) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 h-full bg-zinc-50/30">
                    <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                        <FileSearch className="h-6 w-6 text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 font-medium text-sm">Select a report for {label}</p>
                </div>
            );
        }

        return (
            <ScrollArea className="flex-1 h-full">
                <div className="p-6 space-y-8 origin-top transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }}>
                    <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter opacity-80">Highlights</h4>
                        {data?.part1?.executive_summary?.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 shadow-sm">
                                <p className="text-[11px] text-zinc-600 leading-relaxed"><span className="font-bold text-blue-600">{item.title}:</span> {item.text}</p>
                            </div>
                        ))}
                    </section>
                    <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter opacity-80">Narrative</h4>
                        <p className="text-[11px] text-zinc-600 italic bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">"{data?.part1?.overall_performance}"</p>
                    </section>
                </div>
            </ScrollArea>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[98vw] w-full h-[95vh] overflow-hidden flex flex-col bg-white border-zinc-200 p-0 sm:rounded-2xl shadow-2xl">

                {/* HEADER */}
                <DialogHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <GitCompare className="h-5 w-5 text-blue-500" />
                            </div>
                            <DialogTitle className="text-xl font-black text-zinc-900 uppercase tracking-tighter">
                                Compare Reports
                            </DialogTitle>
                        </div>

  
                    </div>


                    {/* DROPDOWN SELECTORS */}
                    <div className="grid grid-cols-2 gap-4 pb-2">
                        <div className="flex flex-col gap-1">
                            <Select value={selectedId1} onValueChange={handleSelect1}>
                                <SelectTrigger className="h-9 w-full bg-white border-zinc-200 text-xs">
                                    <SelectValue placeholder="Select Report A (Left)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allReports.map(r => (
                                        <SelectItem key={`r1-${r.fileId}`} value={r.fileId} className="text-xs">
                                            {r.millName} - {r.week}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Select value={selectedId2} onValueChange={handleSelect2}>
                                <SelectTrigger className="h-9 w-full bg-white border-zinc-200 text-xs text-right">
                                    <SelectValue placeholder="Select Report B (Right)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allReports.map(r => (
                                        <SelectItem key={`r2-${r.fileId}`} value={r.fileId} className="text-xs">
                                            {r.millName} - {r.week}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full justify-start bg-transparent p-0 border-b border-zinc-200 rounded-none h-auto">
                            {/* <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2 text-xs uppercase tracking-wide">
                                Data View
                            </TabsTrigger> */}
                            <TabsTrigger value="pdf" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none px-4 py-2 text-xs uppercase tracking-wide">
                                PDF View
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </DialogHeader>

                {/* CONTENT */}
                <div className="flex-1 flex overflow-hidden relative">
                    <Tabs value={activeTab} className="flex-1 flex w-full">
                        <TabsContent value="preview" className="flex-1 flex m-0 border-0 p-0 mt-0 w-full">
                            {/* LEFT COLUMN */}
                            <div className="flex-1 h-full border-r border-zinc-200 overflow-hidden relative">
                                {renderContent(data1, loading1, !selectedId1, "Left View")}
                            </div>
                            {/* RIGHT COLUMN */}
                            <div className="flex-1 h-full overflow-hidden relative">
                                {renderContent(data2, loading2, !selectedId2, "Right View")}
                            </div>
                        </TabsContent>

                        <TabsContent value="pdf" className="flex-1 flex m-0 border-0 p-0 mt-0 bg-zinc-50 w-full">
                            <div className="flex-1 h-full border-r border-zinc-200 relative">
                                {pdfUrl1 ? (
                                    <iframe src={`${pdfUrl1}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full" title="PDF1" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-xs">No PDF Loaded</div>
                                )}
                            </div>
                            <div className="flex-1 h-full relative">
                                {pdfUrl2 ? (
                                    <iframe src={`${pdfUrl2}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full" title="PDF2" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-xs">No PDF Loaded</div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
