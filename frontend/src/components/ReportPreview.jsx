import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";


import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, TrendingUp, AlertCircle, Info, LayoutTemplate, FileSearch, Download, Edit, Save, X } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { TextField } from "@mui/material";
import { Button } from "@/components/ui/button";

export default function ReportPreview({ isOpen, onClose, summary,setSummary, fileId, loading, error, onUpdate }) {
    const { token } = useAuth();
    // Editable state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);

    // Initialize edit data when opening or when summary loads
    useEffect(() => {
        if (summary) {
            setEditData(JSON.parse(JSON.stringify(summary)));
        }
    }, [summary]);

    // Reset edit mode on close
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);


    const handleSave = async () => {
        setSaving(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiUrl}/api/reports/update/${fileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editData.data)
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Failed to update");
            setSummary(data);


            setIsEditing(false);
            // Ideally should refresh parent data too, but this shows visual proof via PDF
            alert("Report updated and regenerated successfully!");

        } catch (error) {
            console.error(error);
            alert("Failed to save changes: " + error.message);
            
        } finally {
            setSaving(false);
        }
    };

    const updateHighlight = (index, field, value) => {
        const newData = { ...editData };
        if (newData.data && newData.data.part1 && newData.data.part1.executive_summary) {
            // Clone the 'data' and 'part1' and 'executive_summary' array to ensure immutability
            newData.data = { ...newData.data };
            newData.data.part1 = { ...newData.data.part1 };
            newData.data.part1.executive_summary = [...newData.data.part1.executive_summary];

            newData.data.part1.executive_summary[index] = { ...newData.data.part1.executive_summary[index] };
            newData.data.part1.executive_summary[index][field] = value;
            setEditData(newData);
        }
    };

    const updateNarrative = (value) => {
        // This seems to be replaced by the map loop inline handler, but keeping it updated just in case
        const newData = { ...editData };
        if (newData.data && newData.data.part1) {
            newData.data = { ...newData.data };
            newData.data.part1 = { ...newData.data.part1 };
            newData.data.part1.overall_performance = value;
            setEditData(newData);
        }
    };

    const updateHeader = (field, value) => {
        const newData = { ...editData };
        if (newData.data) {
            newData.data = { ...newData.data };
            if (!newData.data.header) newData.data.header = {};
            newData.data.header = { ...newData.data.header };

            newData.data.header[field] = value;
            setEditData(newData);
        }
    };

    const updateTable = (tableName, rowIndex, cellIndex, value) => {
        const newData = { ...editData };
        if (newData.data && newData.data.tables && newData.data.tables[tableName]) {
            newData.data = { ...newData.data };
            newData.data.tables = { ...newData.data.tables };
            newData.data.tables[tableName] = { ...newData.data.tables[tableName] };
            newData.data.tables[tableName].rows = [...newData.data.tables[tableName].rows];
            newData.data.tables[tableName].rows[rowIndex] = [...newData.data.tables[tableName].rows[rowIndex]];

            newData.data.tables[tableName].rows[rowIndex][cellIndex] = value;
            setEditData(newData);
        }
    };




    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const filename = `${fileId}-executive-summary.pdf`;
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
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[95vh] overflow-hidden flex flex-col bg-white border-zinc-200 p-0 sm:rounded-2xl shadow-2xl">
                <DialogHeader className="p-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-zinc-900 uppercase tracking-tight">
                                Report <span className="text-blue-600">Explorer</span>
                            </DialogTitle>
                        </div>
                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 ml-4">
                            {!isEditing ? (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        size="sm"
                                        disabled={!summary}
                                        className="gap-2 bg-white text-zinc-700 hover:text-blue-600 border-zinc-200"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Content
                                    </Button>
                                    <Button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        variant="default"
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-100"
                                    >
                                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {downloading ? "Wait..." : "PDF"}
                                    </Button>

                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(false)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-500 hover:text-zinc-900"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-100"
                                        size="sm"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>


                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-zinc-100/50">
                    <ScrollArea className="h-full">
                        <div className="flex justify-center p-8 min-h-full">
                            {/* DOCUMENT CONTAINER - MIMICS A PAGE */}
                            <div className="w-full max-w-[210mm] bg-white shadow-sm border border-zinc-200 min-h-[297mm] p-[15mm] sm:p-[20mm] text-zinc-900 font-sans">

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-blue-900" />
                                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Document...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <AlertCircle className="h-12 w-12 text-red-500 opacity-20" />
                                        <h3 className="font-bold text-lg">Data Unavailable</h3>
                                    </div>
                                ) : (isEditing ? editData : summary) ? (
                                    <div className="space-y-6">

                                        {/* --- TITLE AREA --- */}
                                        <div className="text-center space-y-2 mb-8">
                                            <h1 className="text-2xl font-bold text-[#1F4E78] uppercase">Weekly Leadership Review</h1>

                                            {isEditing ? (
                                                <div className="flex flex-col items-center gap-2 max-w-lg mx-auto">
                                                    <TextField
                                                        label="Mill Name"
                                                        variant="standard"
                                                        value={(isEditing ? editData : summary).data.header?.mill_name || ""}
                                                        onChange={(e) => updateHeader('mill_name', e.target.value)}
                                                        fullWidth
                                                        inputProps={{ style: { textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem' } }}
                                                    />
                                                    <div className="flex gap-4 w-full">
                                                        <TextField
                                                            label="Week"
                                                            variant="standard"
                                                            value={(isEditing ? editData : summary).data.header?.week || ""}
                                                            onChange={(e) => updateHeader('week', e.target.value)}
                                                            fullWidth
                                                            inputProps={{ style: { textAlign: 'center', fontSize: '0.875rem' } }}
                                                        />
                                                        <TextField
                                                            label="Comparison"
                                                            variant="standard"
                                                            value={(isEditing ? editData : summary).data.header?.comparison_week || ""}
                                                            onChange={(e) => updateHeader('comparison_week', e.target.value)}
                                                            fullWidth
                                                            inputProps={{ style: { textAlign: 'center', fontSize: '0.875rem' } }}
                                                        />
                                                    </div>
                                                    <TextField
                                                        label="Season Days"
                                                        variant="standard"
                                                        value={(isEditing ? editData : summary).data.header?.season_days || ""}
                                                        onChange={(e) => updateHeader('season_days', e.target.value)}
                                                        style={{ width: '200px' }}
                                                        inputProps={{ style: { textAlign: 'center', fontSize: '0.875rem' } }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-zinc-600 font-bold text-lg">
                                                        {(isEditing ? editData : summary).data.header?.mill_name || "Mill Name"}
                                                    </div>
                                                    <div className="text-zinc-500 text-sm">
                                                        Week: {(isEditing ? editData : summary).data.header?.week} vs Previous Week ({(isEditing ? editData : summary).data.header?.comparison_week})
                                                    </div>
                                                    <div className="text-zinc-500 text-sm">
                                                        Season Days: {(isEditing ? editData : summary).data.header?.season_days}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* --- PART 1 HEADER --- */}
                                        <div className="border-b-2 border-[#1F4E78] mb-6">
                                            <h2 className="text-lg font-bold text-[#1F4E78] uppercase mb-1">Part 1 – Insight Narrative</h2>
                                        </div>

                                        {/* --- 1. EXECUTIVE SUMMARY --- */}
                                        <div className="space-y-4">
                                            <h3 className="text-[#2E75B5] font-bold text-md">1. Executive Summary (Key Insights)</h3>
                                            <ul className="list-disc pl-5 space-y-3">
                                                {(isEditing ? editData : summary).data.part1?.executive_summary?.map((item, idx) => (
                                                    <li key={idx} className="marker:text-zinc-400">
                                                        {isEditing ? (
                                                            <div className="flex flex-col sm:flex-row gap-2 items-start -ml-1 w-full">
                                                                <TextField
                                                                    variant="standard"
                                                                    placeholder="Title"
                                                                    value={item.title}
                                                                    onChange={(e) => updateHighlight(idx, 'title', e.target.value)}
                                                                    sx={{
                                                                        minWidth: '150px',
                                                                        '& .MuiInputBase-root': { padding: 0 }
                                                                    }}
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        style: { fontWeight: 'bold', color: 'black', fontSize: '0.875rem' }
                                                                    }}
                                                                />
                                                                <span className="hidden sm:inline pt-0 font-bold">:</span>
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    variant="standard"
                                                                    placeholder="Description..."
                                                                    value={item.text}
                                                                    onChange={(e) => updateHighlight(idx, 'text', e.target.value)}
                                                                    sx={{
                                                                        '& .MuiInputBase-root': { padding: 0 }
                                                                    }}
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        style: { fontSize: '0.875rem', color: '#27272a', lineHeight: '1.625' }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm leading-relaxed text-zinc-800">
                                                                <span className="font-bold text-black">{item.title}:</span> {item.text}
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* --- GENERIC SECTIONS RENDERER --- */}
                                        {[
                                            { key: 'overall_performance', label: '2. Overall Performance' },
                                            { key: 'benchmark_position', label: '3. Benchmark & Comparative Position' },
                                            { key: 'cane_planning', label: '4. Cane Planning & Control' },
                                            { key: 'engineering', label: '5. Engineering & Milling Performance' },
                                            { key: 'production', label: '6. Production Performance' },
                                            { key: 'power', label: '7. Power Plant Performance' },
                                            { key: 'distillery', label: '8. Distillery Performance' },
                                            { key: 'quality_ehs', label: '9. Quality Control & EHS' },
                                        ].map((section) => {
                                            const val = (isEditing ? editData : summary).data.part1?.[section.key];
                                            // Only render if data exists or we are editing (so user can add data)
                                            if (!val && !isEditing) return null;

                                            return (
                                                <div key={section.key} className="space-y-2 mt-4">
                                                    <h3 className="text-[#2E75B5] font-bold text-md">{section.label}</h3>
                                                    {isEditing ? (
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            variant="standard"

                                                            value={val || ""}
                                                            onChange={(e) => {
                                                                const newData = { ...editData };
                                                                if (newData.data) {
                                                                    newData.data = { ...newData.data };
                                                                    if (!newData.data.part1) newData.data.part1 = {};
                                                                    newData.data.part1 = { ...newData.data.part1 };
                                                                    newData.data.part1[section.key] = e.target.value;
                                                                    setEditData(newData);
                                                                }
                                                            }}
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                style: {
                                                                    fontSize: '0.875rem',
                                                                    lineHeight: '1.625',
                                                                    color: '#27272a', // zinc-800
                                                                    padding: 0
                                                                }
                                                            }}
                                                            sx={{
                                                                '& .MuiInputBase-root': {
                                                                    padding: 0,
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">{val}</p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* --- RISKS --- */}
                                        {(isEditing ? editData : summary).data.part1?.risks && (
                                            <div className="space-y-2 mt-6">
                                                <h3 className="text-[#C00000] font-bold text-md">Risks & Watch-outs for the Coming Week</h3>
                                                <ul className="list-disc pl-5 space-y-2">
                                                    {(isEditing ? editData : summary).data.part1.risks.map((risk, rIdx) => (
                                                        <li key={rIdx} className="marker:text-[#C00000]">
                                                            {isEditing ? (
                                                                <TextField
                                                                    fullWidth
                                                                    multiline
                                                                    variant="standard"
                                                                    value={risk}
                                                                    onChange={(e) => {
                                                                        const newData = { ...editData };
                                                                        if (newData.data && newData.data.part1 && newData.data.part1.risks) {
                                                                            newData.data = { ...newData.data };
                                                                            newData.data.part1 = { ...newData.data.part1 };
                                                                            newData.data.part1.risks = [...newData.data.part1.risks];
                                                                            newData.data.part1.risks[rIdx] = e.target.value;
                                                                            setEditData(newData);
                                                                        }
                                                                    }}
                                                                    InputProps={{
                                                                        disableUnderline: true,
                                                                        style: { fontSize: '0.875rem', color: '#27272a', padding: 0 }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-sm text-zinc-800">{risk}</span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* --- TABLES --- */}
                                        <div className="pt-8 space-y-8">
                                            {/* Table A */}
                                            {(isEditing ? editData : summary).data.tables?.tableA && (
                                                <div className="keep-inside">
                                                    <h3 className="text-[#006666] font-bold text-md mb-2">TABLE A – Quantitative Discussion</h3>
                                                    <div className="border border-zinc-300">
                                                        <Table>
                                                            <TableHeader className="bg-[#006666]">
                                                                <TableRow className="border-zinc-300 hover:bg-[#006666]">
                                                                    {(isEditing ? editData : summary).data.tables.tableA.headers.map((h, i) => (
                                                                        <TableHead key={i} className="text-white font-bold h-10 text-xs border-r border-[#005555] last:border-r-0 text-center">{h}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {(isEditing ? editData : summary).data.tables.tableA.rows.map((row, i) => (
                                                                    <TableRow key={i} className="border-b border-zinc-200 even:bg-zinc-50">
                                                                        {row.map((cell, j) => (
                                                                            <TableCell key={j} className="py-2 px-4 text-xs text-zinc-800 border-r border-zinc-200 last:border-r-0">
                                                                                {isEditing ? (
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        variant="standard"
                                                                                        multiline
                                                                                        value={cell}
                                                                                        onChange={(e) => updateTable('tableA', i, j, e.target.value)}
                                                                                        InputProps={{
                                                                                            disableUnderline: true,
                                                                                            style: { fontSize: '0.75rem', padding: 0 } // match cell text
                                                                                        }}
                                                                                    />
                                                                                ) : cell}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Table B */}
                                            {(isEditing ? editData : summary).data.tables?.tableB && (
                                                <div className="keep-inside">
                                                    <h3 className="text-[#006666] font-bold text-md mb-2">TABLE B – Qualitative Discussion</h3>
                                                    <div className="border border-zinc-300">
                                                        <Table>
                                                            <TableHeader className="bg-[#006666]">
                                                                <TableRow className="border-zinc-300 hover:bg-[#006666]">
                                                                    {(isEditing ? editData : summary).data.tables.tableB.headers.map((h, i) => (
                                                                        <TableHead key={i} className="text-white font-bold h-10 text-xs border-r border-[#005555] last:border-r-0 text-center">{h}</TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {(isEditing ? editData : summary).data.tables.tableB.rows.map((row, i) => (
                                                                    <TableRow key={i} className="border-b border-zinc-200 even:bg-zinc-50">
                                                                        {row.map((cell, j) => (
                                                                            <TableCell key={j} className="py-2 px-4 text-xs text-zinc-800 border-r border-zinc-200 last:border-r-0">
                                                                                {isEditing ? (
                                                                                    <TextField
                                                                                        fullWidth
                                                                                        variant="standard"
                                                                                        multiline
                                                                                        value={cell}
                                                                                        onChange={(e) => updateTable('tableB', i, j, e.target.value)}
                                                                                        InputProps={{
                                                                                            disableUnderline: true,
                                                                                            style: { fontSize: '0.75rem', padding: 0 }
                                                                                        }}
                                                                                    />
                                                                                ) : cell}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
