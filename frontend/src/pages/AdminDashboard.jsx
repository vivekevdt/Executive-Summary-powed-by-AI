import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building, UserPlus, Shield, List, FileText, Download, Loader2 } from "lucide-react";
import { z } from "zod";

const businessSchema = z.object({
    name: z.string().min(1, "Business Name is required"),
    description: z.string().optional()
});

const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"]),
    businessId: z.string().optional()
}).refine((data) => {
    if (data.role === "user" && !data.businessId) {
        return false;
    }
    return true;
}, {
    message: "Business assignment is required for standard users",
    path: ["businessId"]
});

export default function AdminDashboard() {
    const { token } = useAuth();
    const location = useLocation();
    const [businesses, setBusinesses] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Form States
    const [businessName, setBusinessName] = useState("");
    const [businessDesc, setBusinessDesc] = useState("");
    const [businessErrors, setBusinessErrors] = useState({});

    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userRole, setUserRole] = useState("user");
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [userErrors, setUserErrors] = useState({});

    // Initialize/Sync Tab
    const defaultTab = location.state?.tab || "businesses";
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    useEffect(() => {
        fetchBusinesses();
        fetchUsers();
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/reports`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        }
    };

    const handleDownload = async (fileId) => {
        setDownloadingId(fileId);
        try {
            const filename = `${fileId}-executive-summary.pdf`;
            let apiUrl = import.meta.env.VITE_API_URL || "";
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
            alert("Failed to download PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const fetchUsers = async () => {
        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/businesses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBusinesses(data);
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBusiness = async (e) => {
        e.preventDefault();
        setBusinessErrors({});

        const validation = businessSchema.safeParse({ name: businessName, description: businessDesc });
        if (!validation.success) {
            const formattedErrors = validation.error.format();
            setBusinessErrors({
                name: formattedErrors.name?._errors[0],
                description: formattedErrors.description?._errors[0]
            });
            return;
        }

        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/businesses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: businessName, description: businessDesc })
            });

            if (res.ok) {
                alert("Business created successfully!");
                setBusinessName("");
                setBusinessDesc("");
                fetchBusinesses();
            } else {
                alert("Failed to create business");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setUserErrors({});

        const validation = userSchema.safeParse({
            email: userEmail,
            password: userPassword,
            role: userRole,
            businessId: selectedBusiness || undefined
        });

        if (!validation.success) {
            const formattedErrors = validation.error.format();
            // Handle refined errors (root level) vs field errors
            // Zod error format for refinements might put error in different place?
            // safeParse returns .error which has .format().
            // If refinement fails on "businessId", formattedErrors.businessId._errors array will have it.

            setUserErrors({
                email: formattedErrors.email?._errors[0],
                password: formattedErrors.password?._errors[0],
                role: formattedErrors.role?._errors[0],
                businessId: formattedErrors.businessId?._errors[0]
            });
            return;
        }

        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userEmail,
                    password: userPassword,
                    role: userRole,
                    businessId: selectedBusiness
                })
            });

            if (res.ok) {
                alert("User created successfully!");
                setUserEmail("");
                setUserPassword("");
                fetchUsers();
            } else {
                const data = await res.json();
                alert(`Failed: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative min-h-screen w-full">
            {/* Background Image Layer */}
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] opacity-40"
                style={{ backgroundImage: 'url("/bg-ai.png")' }}
            />
            <div className="absolute inset-0 z-0 bg-white/40" />

            {/* Main Content */}
            <div className="relative z-10 container mx-auto py-10 px-4 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-zinc-900 rounded-xl">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
                        <p className="text-zinc-500">Manage businesses, users, and reports</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-8 p-1 bg-zinc-100 rounded-xl inline-flex w-auto">
                        <TabsTrigger value="businesses" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Building className="w-4 h-4 mr-2" />
                            Manage Businesses
                        </TabsTrigger>
                        <TabsTrigger value="users" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Manage Users
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <List className="w-4 h-4 mr-2" />
                            Report Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="businesses" className="space-y-6">
                        {/* Create Business - Top Card */}
                        <Card className="border-zinc-200 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Create New Business</CardTitle>
                                <CardDescription className="text-base">Add a new subsidiary or mill to the system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateBusiness} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-base">Business Name</Label>
                                            <Input
                                                value={businessName}
                                                onChange={(e) => {
                                                    setBusinessName(e.target.value);
                                                    if (businessErrors.name) setBusinessErrors(prev => ({ ...prev, name: undefined }));
                                                }}
                                                placeholder="e.g. Gobind Sugar Mill"
                                                className={`h-12 text-base ${businessErrors.name ? "border-red-500" : ""}`}
                                            />
                                            {businessErrors.name && <p className="text-sm text-red-500">{businessErrors.name}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base">Description</Label>
                                            <Input
                                                value={businessDesc}
                                                onChange={(e) => setBusinessDesc(e.target.value)}
                                                placeholder="Optional description"
                                                className="h-12 text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 text-base">
                                            <Plus className="w-5 h-5 mr-2" /> Create Business
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Existing Businesses List */}
                        <Card className="border-zinc-200 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Existing Businesses</CardTitle>
                                <CardDescription className="text-base">Overview of all registered entities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-left">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">ID</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Business Name</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Description</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Total Users</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Total Reports</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {businesses.map((b) => (
                                                <tr key={b.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium text-base">
                                                        <div className="bg-white px-3 py-1 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600 inline-block">
                                                            #{b.id}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                <Building className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <span className="font-semibold text-zinc-900 text-base">{b.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle text-zinc-500 text-base">
                                                        {b.description || "-"}
                                                    </td>
                                                    <td className="p-4 align-middle text-base">
                                                        <span className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg w-fit">
                                                            <UserPlus className="h-4 w-4 text-zinc-500" />
                                                            <span className="font-semibold text-zinc-700">{b._count?.users || 0}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle text-base">
                                                        <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg w-fit border border-blue-100">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            <span className="font-semibold text-blue-700">{b._count?.reports || 0}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {businesses.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-zinc-500 text-lg">No businesses found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>


                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        {/* Register User - Top Card */}
                        <Card className="border-zinc-200 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Register New User</CardTitle>
                                <CardDescription className="text-base">Create a user account and assign them to a business</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateUser} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-base">Email Address</Label>
                                            <Input
                                                type="email"
                                                value={userEmail}
                                                onChange={(e) => {
                                                    setUserEmail(e.target.value);
                                                    if (userErrors.email) setUserErrors(prev => ({ ...prev, email: undefined }));
                                                }}
                                                required
                                                className={`h-12 text-base ${userErrors.email ? "border-red-500" : ""}`}
                                            />
                                            {userErrors.email && <p className="text-sm text-red-500">{userErrors.email}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base">Password</Label>
                                            <Input
                                                type="password"
                                                value={userPassword}
                                                onChange={(e) => {
                                                    setUserPassword(e.target.value);
                                                    if (userErrors.password) setUserErrors(prev => ({ ...prev, password: undefined }));
                                                }}
                                                required
                                                className={`h-12 text-base ${userErrors.password ? "border-red-500" : ""}`}
                                            />
                                            {userErrors.password && <p className="text-sm text-red-500">{userErrors.password}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-base">Role</Label>
                                            <Select
                                                value={userRole}
                                                onValueChange={(val) => {
                                                    setUserRole(val);
                                                    if (val === "admin") setSelectedBusiness(""); // Clear business if admin
                                                    if (userErrors.role) setUserErrors(prev => ({ ...prev, role: undefined }));
                                                }}
                                            >
                                                <SelectTrigger className={`h-12 text-base ${userErrors.role ? "border-red-500 ring-offset-red-500" : ""}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User (Viewer)</SelectItem>
                                                    <SelectItem value="admin">System Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {userErrors.role && <p className="text-sm text-red-500">{userErrors.role}</p>}
                                        </div>
                                        {userRole !== 'admin' && (
                                            <div className="space-y-3">
                                                <Label className="text-base">Assign Business</Label>
                                                <Select
                                                    value={selectedBusiness}
                                                    onValueChange={(val) => {
                                                        setSelectedBusiness(val);
                                                        // Clear error when user selects a business
                                                        if (userErrors.businessId) setUserErrors(prev => ({ ...prev, businessId: undefined }));
                                                    }}
                                                >
                                                    <SelectTrigger className={`h-12 text-base ${userErrors.businessId ? "border-red-500 ring-offset-red-500" : ""}`}>
                                                        <SelectValue placeholder="Select Business" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {businesses.map((b) => (
                                                            <SelectItem key={b.id} value={String(b.id)}>
                                                                {b.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {userErrors.businessId && <p className="text-sm text-red-500">{userErrors.businessId}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 text-base">
                                            <UserPlus className="w-5 h-5 mr-2" /> Register User
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* List Users - Bottom Card */}
                        <Card className="border-zinc-200 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Registered Users</CardTitle>
                                <CardDescription className="text-base">All users with access to the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-left">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Email Address</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Role</th>
                                                <th className="h-14 px-4 align-middle font-medium text-muted-foreground text-base">Assigned Business</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {users.map((user) => (
                                                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle font-medium text-base text-zinc-800">{user.email}</td>
                                                    <td className="p-4 align-middle">
                                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                            {user.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle text-base text-zinc-600">
                                                        <div className="flex items-center gap-2">
                                                            {user.business ? (
                                                                <>
                                                                    <Building className="h-4 w-4 text-zinc-400" />
                                                                    {user.business.name}
                                                                </>
                                                            ) : (
                                                                <span className="text-zinc-400 italic">Global / Unassigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-zinc-500 text-lg">No users found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports">
                        <Card>
                            <CardHeader>
                                <CardTitle>Global Reports Archive</CardTitle>
                                <CardDescription>Comprehensive list of all reports across all businesses</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-left">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Details</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Business</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Week</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created At</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {reports.map((report) => (
                                                <tr key={report.fileId} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-zinc-900">{report.millName}</p>
                                                                <p className="text-[10px] text-zinc-400 font-mono tracking-wider">{report.fileId.split('-')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle font-medium text-zinc-700">{report.businessName}</td>
                                                    <td className="p-4 align-middle text-zinc-600">{report.userEmail}</td>
                                                    <td className="p-4 align-middle">
                                                        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                                                            {report.week}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle text-zinc-500">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => handleDownload(report.fileId)}
                                                            disabled={downloadingId === report.fileId}
                                                        >
                                                            {downloadingId === report.fileId ? (
                                                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                                            ) : (
                                                                <Download className="h-4 w-4 text-zinc-500 hover:text-blue-600" />
                                                            )}
                                                            <span className="sr-only">Download PDF</span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reports.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-zinc-500">No reports generated yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
