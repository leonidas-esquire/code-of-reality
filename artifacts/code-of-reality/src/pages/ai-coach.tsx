import { useState, useEffect, useRef } from "react";
import { useListAnthropicConversations, useGetAnthropicMessages, useCreateAnthropicConversation } from "@workspace/api-client-react";
import { Cpu, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PaywallGate } from "@/components/paywall-gate";

export default function AiCoachPage() {
  return (
    <PaywallGate requiredTier="ARCHITECT" featureDescription="E₈ AI Reality Coach">
      <AiCoachInner />
    </PaywallGate>
  );
}

function AiCoachInner() {
  const { data: conversations } = useListAnthropicConversations();
  const createConversation = useCreateAnthropicConversation();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  
  const { data: messages, refetch: refetchMessages } = useGetAnthropicMessages(
    activeConversationId || "",
    { query: { enabled: !!activeConversationId } }
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent]);

  const handleStartNew = () => {
    createConversation.mutate({ data: { title: "New Session" } }, {
      onSuccess: (data) => {
        setActiveConversationId(data.id);
      }
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConversationId || isStreaming) return;

    const messageText = input;
    setInput("");
    setIsStreaming(true);
    setStreamedContent("");

    try {
      const token = localStorage.getItem("cor_token");
      const response = await fetch(`/api/anthropic/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: messageText })
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'content_block_delta') {
                  setStreamedContent(prev => prev + data.delta.text);
                }
              } catch (e) {
                console.error("Error parsing SSE data", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    } finally {
      setIsStreaming(false);
      refetchMessages();
      setStreamedContent("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Oracle Intelligence</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Architectural Guidance System</p>
        </div>
        <Button 
          onClick={handleStartNew}
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          Initialize New Protocol
        </Button>
      </header>

      <div className="flex-1 sacred-border bg-card/60 backdrop-blur-md clip-corners flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages?.map((msg) => (
            <div key={msg.id} className={cn(
              "max-w-[80%] flex",
              msg.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
            )}>
              <div className={cn(
                "p-4 clip-corners",
                msg.role === 'user' 
                  ? "bg-primary/10 border border-primary/30 text-foreground" 
                  : "bg-background/80 border border-border/50 text-foreground"
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center text-primary/70 mb-2 font-mono text-[10px] uppercase">
                    <Cpu className="w-3 h-3 mr-2" /> Oracle
                  </div>
                )}
                <div className="font-serif leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="max-w-[80%] mr-auto justify-start flex">
              <div className="p-4 clip-corners bg-background/80 border border-primary/50 text-foreground shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                <div className="flex items-center text-primary mb-2 font-mono text-[10px] uppercase animate-pulse">
                  <Cpu className="w-3 h-3 mr-2" /> Oracle Computing...
                </div>
                <div className="font-serif leading-relaxed whitespace-pre-wrap">
                  {streamedContent}
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border/30 bg-background/50">
          <form onSubmit={handleSend} className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Transmit inquiry to Oracle..."
              className="flex-1 bg-background/80 border-primary/30 font-mono text-sm focus-visible:ring-primary/50 rounded-none clip-corners"
              disabled={isStreaming || !activeConversationId}
            />
            <Button 
              type="submit"
              disabled={isStreaming || !input.trim() || !activeConversationId}
              className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners"
            >
              {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
