
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Factory, Leaf, Zap } from "lucide-react";
import ChatBot from "@/components/ChatBot";

export default function Dashboard() {
    const navigate = useNavigate();

    const businesses = [
        {
            id: "spe",
            name: "Sugar, Power & Ethanol",
            description: "Executive Summary & Analytics System",
            icon: <Factory className="h-8 w-8 text-blue-600" />,
            features: ["Weekly Report Generation", "Historical Archives"],
            route: "/spe",
            image: "/login-side.png" // Reusing the industrial image we generated earlier
        }
    ];

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
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900">
                        Business Units
                    </h1>
                    <p className="text-zinc-500 text-lg max-w-2xl">
                        Select a business unit to access specific executive tools and reports.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {businesses.map((business) => (
                        <Card
                            key={business.id}
                            className="group relative overflow-hidden border-zinc-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer bg-white"
                            onClick={() => navigate(business.route)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10" />
                                <img
                                    src={business.image}
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
                                        {business.icon}
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900">
                                    {business.name}
                                </CardTitle>
                                <CardDescription className="text-zinc-500 line-clamp-2">
                                    {business.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="relative z-10">
                                <div className="space-y-3 pt-2">
                                    {business.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    className="w-full mt-6 bg-white border border-zinc-200 text-zinc-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                >
                                    Access Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

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
                      <ChatBot />

        </main>
    );
}
