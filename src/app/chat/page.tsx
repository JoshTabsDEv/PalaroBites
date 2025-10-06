"use client"

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [canSend, setCanSend] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const { data } = await supabase
        .from("messages")
        .select("id,user_id,content,created_at")
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((data as Message[]) || []);

      // Check if admin has started a conversation for this user
      if (session?.user) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('admin_started')
          .eq('user_id', session.user.id)
          .single();
        setCanSend(Boolean(conv?.admin_started));
      } else {
        setCanSend(false);
      }

      const channel = supabase
        .channel("messages")
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async () => {
    if (!user || !text.trim() || !canSend) return;
    await supabase.from("messages").insert({ user_id: user.id, content: text.trim() });
    setText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Chat</h1>
        {!user && (
          <div className="text-sm text-muted-foreground mb-4">Sign in to send messages. You can still read messages.</div>
        )}
        <div className="border rounded-xl bg-card h-[60vh] p-4 flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] ${m.user_id === user?.id ? 'ml-auto text-right' : ''}`}>
                <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.user_id === user?.id ? 'bg-rose-500 text-white' : 'bg-muted'}`}>
                  {m.content}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={user ? (canSend ? 'Type a message…' : 'Wait for admin to start chat') : 'Sign in to chat'} disabled={!user || !canSend} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
            <Button onClick={send} disabled={!user || !canSend || !text.trim()}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


