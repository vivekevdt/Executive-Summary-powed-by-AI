import { z } from "zod";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowRight, AlertCircle, Building2, Lock, Mail } from "lucide-react";

import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";

// Create a custom Material UI theme
const muiTheme = createTheme({
    palette: {
        primary: {
            main: "#2563eb",
        },
        text: {
            primary: "#18181b",
            secondary: "#52525b"
        }
    },
    typography: {
        fontFamily: "inherit",
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.5)", // Semi-transparent inputs
                        borderRadius: "0.75rem",
                        "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover fieldset": {
                            borderColor: "rgba(37, 99, 235, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#2563eb",
                        },
                    },
                    // Label (placeholder) styling
                    "& .MuiInputLabel-root": {
                        color: "#52525b", // Zinc-600
                        fontWeight: 500,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#2563eb", // Blue-600
                        fontWeight: 600,
                    },
                },
            },
        },
    },
});

// ... existing imports

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});
        setLoading(true);

        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
            const formattedErrors = validation.error.format();
            setFieldErrors({
                email: formattedErrors.email?._errors[0],
                password: formattedErrors.password?._errors[0]
            });
            setLoading(false);
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            navigate("/"); // Redirect to dashboard/home after login
        } else {
            setError(result.error || "Failed to login");
        }
        setLoading(false);
    };

    return (
        <ThemeProvider theme={muiTheme}>
            <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">

                {/* Full Screen Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-zinc-900/40 z-10" />
                    <img
                        src="/login-bg.png"
                        alt="Corporate Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="w-full max-w-md relative z-20 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="border-white/40 shadow-2xl backdrop-blur-lg bg-white/70 text-zinc-900 border">
                        <CardHeader className="space-y-1 text-center pb-6 pt-8">
                            <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
                                Executive Portal
                            </CardTitle>
                            <CardDescription className="text-zinc-600 font-medium">
                                Sign in to access strategic business intelligence
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 text-sm font-medium text-red-600 bg-red-50/80 rounded-xl border border-red-200 flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-10 flex flex-col gap-2">
                                    <TextField
                                        id="email"
                                        label="Email Address"
                                        variant="outlined"
                                        fullWidth
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                                        }}
                                        disabled={loading}
                                        placeholder="name@enterprise.com"
                                        error={!!fieldErrors.email}
                                        helperText={fieldErrors.email}
                                    />

                                    <TextField
                                        id="password"
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                                        }}
                                        disabled={loading}
                                        placeholder="••••••••"
                                        error={!!fieldErrors.password}
                                        helperText={fieldErrors.password}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all mt-2"
                                    disabled={loading}
                                >
                                    {loading ? "Authenticating..." : (
                                        <span className="flex items-center gap-2">
                                            Sign In <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-zinc-600 pb-8 pt-2">
                            <div className="flex flex-col gap-1 items-center opacity-80">
                                <span className="font-semibold">Protected by Enterprise Security</span>
                                <span className="text-xs">Authorized personnel only • 256-bit Encryption</span>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Login;
