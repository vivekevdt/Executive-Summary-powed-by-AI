
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Factory, Leaf, Zap, Loader2, List } from "lucide-react";
import ChatBot from "@/components/ChatBot";

export default function Dashboard() {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [adminView, setAdminView] = useState('selection'); // 'selection' | 'businesses'

    useEffect(() => {
        // Redirection for 'user' role
        if (user && user.role === 'user') {
            const businessName = user.business?.name; // Assuming user object has business details
            navigate("/spe", {
                replace: true,
                state: {
                    businessId: user.businessId,
                    businessName: businessName
                }
            });
            return;
        }

        // If admin, fetch businesses to display dashboard
        fetchBusinesses();
    }, [user, navigate]);

    const fetchBusinesses = async () => {
        try {
            let apiUrl = import.meta.env.VITE_API_URL || "";
            const res = await fetch(`${apiUrl}/api/businesses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const allData = await res.json();

                if (user?.role === 'admin') {
                    setBusinesses(allData);
                } else if (user?.businessId) {
                    setBusinesses(allData.filter(b => b.id === user.businessId));
                } else {
                    setBusinesses([]); // No business assigned
                }
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error);
        } finally {
            setLoading(false);
        }
    };

    // Admin Landing View
    if (user?.role === 'admin' && adminView === 'selection') {
        return (
            <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden p-8 flex items-center justify-center">
                {/* Background Image Layer */}
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] opacity-40"
                    style={{ backgroundImage: 'url("/bg-ai.png")' }}
                />
                <div className="absolute inset-0 z-0 bg-white/40" />

                <div className="relative z-10 max-w-6xl w-full space-y-16">
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center p-2 bg-blue-50 border border-blue-100 rounded-full mb-4">
                            <span className="px-4 py-1 text-sm font-bold text-blue-700 uppercase tracking-widest">Administration & Control</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tight text-zinc-900 leading-tight">
                            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dashboard</span>
                        </h1>
                        <p className="text-zinc-500 text-xl max-w-2xl mx-auto leading-relaxed">
                            Welcome to the central command center. Select an administrative module below to manage system reports, users, and business configurations with enhanced precision.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        {/* Card 2: Report Management */}
                        <Card
                            className="group relative overflow-hidden border-zinc-200 hover:shadow-2xl hover:border-emerald-500 transition-all duration-500 cursor-pointer bg-white h-96 flex flex-col justify-center items-center text-center p-8"
                            onClick={() => navigate('/admin', { state: { tab: 'reports' } })}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <CardContent className="relative z-10 space-y-8 w-full">
                                <div className="h-24 w-24 bg-emerald-100/50 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm border border-emerald-100">
                                    <List className="h-12 w-12 text-emerald-600" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">Report Management</h3>
                                    <p className="text-zinc-500 text-lg leading-relaxed px-4">
                                        Access comprehensive report archives, audit trails, and document generation tools.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <span className="text-emerald-600 font-semibold flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                                        Access Module <ArrowRight className="h-5 w-5" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: User Management */}
                        <Card
                            className="group relative overflow-hidden p-4 border-zinc-200 hover:shadow-2xl hover:border-purple-500 transition-all duration-500 cursor-pointer bg-white h-96 flex flex-col justify-center items-center text-center p-8"
                            onClick={() => navigate('/admin', { state: { tab: 'users' } })}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <CardContent className="relative z-10 space-y-8 w-full">
                                <div className="h-24 w-24 bg-purple-100/50 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 shadow-sm border border-purple-100">
                                    <Zap className="h-12 w-12 text-purple-600" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">User Management</h3>
                                    <p className="text-zinc-500 text-lg leading-relaxed px-4">
                                        Configure system access, manage user roles, and control permission levels effortlessly.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <span className="text-purple-600 font-semibold flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                                        Access Module <ArrowRight className="h-5 w-5" />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden p-8">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] opacity-40"
                style={{ backgroundImage: 'url("/bg-ai.png")' }}
            />
            <div className="absolute inset-0 z-0 bg-white/40" />

            <div className="relative z-10 max-w-7xl mx-auto space-y-12">

                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        onClick={() => setAdminView('selection')}
                        className="mb-4 pl-0 hover:bg-transparent hover:underline"
                    >
                        ← Back to Admin Home
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                        Business Units
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl">
                        Select a business unit to view its report archive.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        </div>
                    ) : businesses.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-zinc-500">
                            No businesses assigned. Please contact administrator.
                        </div>
                    ) : (
                        businesses.map((business) => (
                            <Card
                                key={business.id}
                                className="group relative overflow-hidden border-zinc-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer bg-white"
                                onClick={() => navigate("/spe/reports", { state: { businessId: business.id, businessName: business.name } })}
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-transparent to-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10" />
                                    <img
                                        src="/login-side.png"
                                        alt={business.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm">
                                        Running
                                    </div>
                                </div>

                                <CardHeader className="relative z-10 pb-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                                            <Factory className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-zinc-900">
                                        {business.name}
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500 line-clamp-2">
                                        {business.description || "Executive Summary & Analytics System"}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="relative z-10">
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                            Weekly Report Generation
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                            Historical Archives
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-6 bg-white border border-zinc-200 text-zinc-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                    >
                                        Access Dashboard
                                    </Button>
                                </CardContent>
                            </Card>
                        )))}

                    {/* Placeholder for future business units */}
                    <Card className="border-2 border-dashed border-zinc-200 bg-transparent flex flex-col items-center justify-center p-12 text-center space-y-4 hover:bg-white/50 transition-colors group cursor-not-allowed opacity-80 backdrop-blur-sm">
                        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Leaf className="h-8 w-8 text-zinc-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Coming Soon</p>
                        </div>
                    </Card>

                    <Card className="border-2 border-dashed border-zinc-200 bg-transparent flex flex-col items-center justify-center p-12 text-center space-y-4 hover:bg-white/50 transition-colors group cursor-not-allowed opacity-80 backdrop-blur-sm">
                        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="h-8 w-8 text-zinc-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-500">Coming Soon</p>
                        </div>
                    </Card>

                </div>
            </div>
            {/* <ChatBot /> */}

        </main>
    );
}
