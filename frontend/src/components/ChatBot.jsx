import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: "assistant",
            content: "Hello! I am Executive AI. How can I assist you with your executive summaries today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate API call/processing
        setTimeout(() => {
            const assistantMessage = {
                id: Date.now() + 1,
                role: "assistant",
                content: "I've received your request. I'm processing the executive details now.",
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <div className={cn("fixed bottom-6 right-6 z-50 transition-all duration-300", isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100")}>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-110"
                >
                    <MessageCircle className="h-8 w-8" />
                    <span className="sr-only">Open Chat</span>
                </Button>
            </div>

            {/* Chat Window */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-[380px] sm:w-[450px] transition-all duration-500 ease-in-out origin-bottom-right",
                    isOpen
                        ? "scale-100 opacity-100 translate-y-0"
                        : "scale-90 opacity-0 translate-y-10 pointer-events-none"
                )}
            >
                <div className="flex flex-col h-[600px] max-h-[80vh] rounded-2xl overflow-hidden glass shadow-2xl border border-white/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-primary/10 backdrop-blur-md border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-lg leading-none text-foreground tracking-tight">
                                    Executive AI
                                </h3>
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-white/40 dark:bg-black/20" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <User className="h-5 w-5" />
                                        ) : (
                                            <Bot className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl shadow-sm text-sm",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 text-foreground rounded-tl-sm"
                                        )}
                                    >
                                        {msg.content}
                                        <span className="text-[10px] opacity-50 block mt-1 text-right">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="p-4 rounded-2xl rounded-tl-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-white/60 dark:bg-black/40 backdrop-blur-md border-t border-white/20">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="bg-white/50 dark:bg-gray-900/50 border-white/30 focus-visible:ring-primary/50"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                size="icon"
                                className={cn(
                                    "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300",
                                    input.trim() ? "scale-100" : "scale-90 opacity-70"
                                )}
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="text-[10px] text-center text-muted-foreground mt-2">
                            Powered by Executive AI Model
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
