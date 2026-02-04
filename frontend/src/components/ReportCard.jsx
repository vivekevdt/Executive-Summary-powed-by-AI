import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Eye, GitCompare, Calendar, Factory, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function ReportCard({ report, onView }) {
    const { token } = useAuth();
    const [downloadingDoc, setDownloadingDoc] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const date = new Date(report.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    const handleDownload = async (type, fileId) => {
        const isPdf = type === 'pdf';
        const setDownloading = isPdf ? setDownloadingPdf : setDownloadingDoc;
        const filename = `${fileId}-executive-summary.${type}`;

        setDownloading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/reports/download/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to download");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            alert("Failed to download file");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className={
            "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-zinc-200 bg-white shadow-sm"
        }>


            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Factory className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-zinc-900 truncate">
                        {report.millName}
                    </CardTitle>
                </div>
                <CardDescription className="flex items-center gap-2 text-zinc-500 font-medium">
                    <Calendar className="h-4 w-4" />
                    {report.week}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-6">
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Generated on {date}
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-4 border-t border-zinc-100">
                <div className="grid grid-cols-3 gap-2 w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-blue-600 transition-colors px-2"
                        onClick={() => onView(report.fileId)}
                    >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-blue-600 transition-colors px-2"
                        disabled={downloadingDoc}
                        onClick={() => handleDownload('docx', report.fileId)}
                    >
                        {downloadingDoc ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Download className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline text-[10px]">{downloadingDoc ? "..." : "DOCX"}</span>
                        <span className="sm:hidden text-[10px]">{downloadingDoc ? "..." : "DOCX"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-red-600 transition-colors px-2"
                        disabled={downloadingPdf}
                        onClick={() => handleDownload('pdf', report.fileId)}
                    >
                        {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <FileText className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline text-[10px]">{downloadingPdf ? "..." : "PDF"}</span>
                        <span className="sm:hidden text-[10px]">{downloadingPdf ? "..." : "PDF"}</span>

                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

