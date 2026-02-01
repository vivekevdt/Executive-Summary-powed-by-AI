import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, FileClock, SearchX, FileText, ExternalLink } from "lucide-react";

export default function ReportsTable({ reports = [] }) {
  const isEmpty = reports.length === 0;

  return (
    <div className="glass rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-2xl">
      <div className="px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 rounded-xl">
            <FileClock className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Recent Generation</h3>
            <p className="text-sm text-zinc-500 font-medium">Automated AI Summaries Output</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] h-12 px-8">Analysis File</TableHead>
              <TableHead className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] h-12">Timestamp</TableHead>
              <TableHead className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] h-12 text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="h-80 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-1000">
                    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 group transition-all hover:border-zinc-700">
                      <SearchX className="h-10 w-10 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-zinc-300">Vault is Empty</p>
                      <p className="text-sm text-zinc-600 max-w-[300px] mx-auto leading-relaxed">
                        Your AI-generated summaries will manifest here once the analysis process is complete.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r) => (
                <TableRow key={r.fileId} className="border-zinc-800/50 group transition-all hover:bg-white/[0.02]">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-blue-500 group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-all">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-100 font-semibold text-lg tracking-tight group-hover:translate-x-1 transition-transform">
                          {r.millName || "Govind Sugar mill"}
                        </span>
                        <span className="text-zinc-500 text-sm font-medium">
                          {r.week || r.fileName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 font-medium">
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-zinc-400 hover:text-white hover:bg-blue-600 transition-all rounded-lg h-10 px-4 group/btn shadow-none"
                    >
                      <a
                        href={`http://localhost:5000/${r.filePath}`}
                        download={`${r.millName || 'Report'}-${r.week || 'Summary'}.docx`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileDown className="h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                        <span className="font-bold">Download DOCX</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))

            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
