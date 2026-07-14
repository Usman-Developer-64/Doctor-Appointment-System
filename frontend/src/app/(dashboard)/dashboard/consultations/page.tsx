"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { io, Socket } from "socket.io-client";
import {
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  MessageSquare,
  Loader2,
  Plus,
  Image as ImageIcon,
  FileText,
  Volume2,
  Circle,
  Search,
  CheckCircle,
  Clock,
  X,
  Bell,
  Sparkles,
} from "lucide-react";

interface ChatMessage {
  senderName: string;
  text: string;
  createdAt: string;
  attachmentType?: "image" | "document" | "voice";
  attachmentUrl?: string;
  fileName?: string;
  senderId?: string;
  readBy?: string[];
}

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customChats, setCustomChats] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [activePartnerId, setActivePartnerId] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isCalling, setIsCalling] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [peerName, setPeerName] = useState("Consultation Partner");
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerLastSeen, setPeerLastSeen] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [incomingCallOffer, setIncomingCallOffer] = useState<any | null>(null);
  const [bgNotification, setBgNotification] = useState<any | null>(null);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const globalSocketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    setIsLoadingChats(true);
    api
      .get("/appointments/my")
      .then((res) => setAppointments(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingChats(false));

    if (user.role === "patient") {
      api
        .get("/doctors")
        .then((res) => setDbDoctors(res.data.data || []))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleSelectConversation = (
    id: string,
    name: string,
    partnerId: string,
  ) => {
    setRoomId(id);
    setPeerName(name);
    setActivePartnerId(partnerId);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      senderName: `${user?.firstName} ${user?.lastName}`,
      text: chatInput,
      createdAt: new Date().toISOString(),
      senderId: user?._id,
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-6 relative">
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex h-[78vh] min-h-[500px]">
        {/* Left Sidebar */}
        <div className="w-[300px] md:w-[350px] shrink-0 border-r border-border bg-muted/10 flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-[9px] text-muted-foreground capitalize font-semibold">
                  {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-border bg-card shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search consult chats..."
                className="pl-9 h-9 text-xs rounded-xl bg-muted/30 border-none"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-card">
            {appointments.map((app) => {
              const opposite =
                user.role === "doctor" ? app.patient : app.doctor;
              if (!opposite) return null;
              return (
                <button
                  key={app._id}
                  onClick={() =>
                    handleSelectConversation(
                      app._id,
                      `${opposite.firstName} ${opposite.lastName}`,
                      opposite._id,
                    )
                  }
                  className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-colors ${roomId === app._id ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50"}`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {opposite.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs truncate">
                      {opposite.firstName} {opposite.lastName}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Click to open chat session
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col justify-between bg-muted/5">
          {roomId ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-border bg-card flex items-center justify-between h-16 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {peerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">
                      {peerName}
                    </h4>
                    <p className="text-[9px] text-emerald-500 font-medium">
                      Active Consultation Session
                    </p>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/30">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user._id;
                  return (
                    <div
                      key={idx}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 text-xs ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"}`}
                      >
                        <p className="font-semibold text-[10px] mb-1 opacity-80">
                          {msg.senderName}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border bg-card flex items-center gap-2 shrink-0"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your medical consultation message..."
                  className="flex-1 h-10 text-xs rounded-xl"
                />
                <Button
                  size="sm"
                  type="submit"
                  className="h-10 px-4 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3 animate-bounce" />
              <h3 className="font-bold text-xs text-foreground">
                No Chat Selected
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-xs">
                Select a doctor or patient session from the left sidebar list to
                start exchanging real-time messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
