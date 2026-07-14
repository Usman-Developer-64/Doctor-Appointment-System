'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { io, Socket } from 'socket.io-client';
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
} from 'lucide-react';

interface ChatMessage {
  senderName: string;
  text: string;
  createdAt: string;
  attachmentType?: 'image' | 'document' | 'voice';
  attachmentUrl?: string;
  fileName?: string;
}

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom started chats (saved to database/localStorage)
  const [customChats, setCustomChats] = useState<any[]>([]);

  // Selected conversation states
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Call states
  const [isCalling, setIsCalling] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  // Online / Last Seen status of selected peer
  const [peerName, setPeerName] = useState('Consultation Partner');
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerLastSeen, setPeerLastSeen] = useState<string | null>(null);

  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [incomingCallOffer, setIncomingCallOffer] = useState<any | null>(null);

  // Floating notifications state
  const [bgNotification, setBgNotification] = useState<{ senderName: string; text: string; roomId: string } | null>(null);

  // Modals / Directory states
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Voice message recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  // WebRTC & Socket refs
  const socketRef = useRef<Socket | null>(null);
  const globalSocketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // File input refs
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Video elements refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-scroll chat ref
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Play a beautiful synthesized double-beep alert for notifications
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 850;
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.08);

      // Beep 2 (delayed, higher pitch)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.08);
      }, 100);
    } catch (e) {
      console.error('AudioContext blocked or unsupported:', e);
    }
  };

  // Load appointments (chats) on mount
  useEffect(() => {
    if (!user) return;
    setIsLoadingChats(true);
    
    // Load appointments (chat list)
    api.get('/appointments/my')
      .then((res) => {
        setAppointments(res.data.data || []);
      })
      .catch((err) => console.error('Failed to load chats:', err))
      .finally(() => setIsLoadingChats(false));

    // Pre-fetch all database doctors if user is a patient so search functions work instantly
    if (user.role === 'patient') {
      api.get('/doctors')
        .then((res) => {
          setDbDoctors(res.data.data || []);
        })
        .catch((err) => console.error('Failed to fetch doctors:', err));
    }

    // Connect to global socket for background notifications
    const globalSocket = io('http://localhost:2800/telemedicine', {
      transports: ['websocket'],
    });
    globalSocketRef.current = globalSocket;

    globalSocket.emit('join-room', {
      roomId: `global_${user._id}`,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
    });

    // Listen for background notifications
    globalSocket.on('new-message-notification', (data) => {
      // Auto register custom chat rooms in sidebar
      if (data.roomId.startsWith('chat_')) {
        const storedCustomStr = localStorage.getItem(`custom_chats_${user._id}`) || '[]';
        const parsedCustom = JSON.parse(storedCustomStr);
        const exists = parsedCustom.some((c: any) => c.roomId === data.roomId);
        if (!exists) {
          const parts = data.roomId.split('_');
          const oppId = parts[1] === user._id ? parts[2] : parts[1];
          const newCustom = {
            roomId: data.roomId,
            partnerName: data.senderName,
            partnerId: oppId,
            specialization: user.role === 'doctor' ? 'Patient Inquiry' : 'Specialist',
            date: new Date().toISOString(),
          };
          const updated = [...parsedCustom, newCustom];
          setCustomChats(updated);
          localStorage.setItem(`custom_chats_${user._id}`, JSON.stringify(updated));
        }
      }

      // Only show notification if the message is NOT from the active selected chat
      if (data.roomId !== roomId) {
        setBgNotification(data);
        playNotificationSound();
        // Auto dismiss after 4 seconds
        setTimeout(() => setBgNotification(null), 4000);
      }
    });

    // Load any custom local storage chats
    const savedCustom = localStorage.getItem(`custom_chats_${user._id}`);
    if (savedCustom) {
      setCustomChats(JSON.parse(savedCustom));
    }

    return () => {
      globalSocket.disconnect();
    };
  }, [user, roomId]);

  // Clean up WebRTC streams on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (!user) return null;

  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    setIsCalling(false);
    setIncomingCallOffer(null);
    setRemoteVideoEnabled(true);
    setRemoteAudioEnabled(true);
  };

  // Open conversation from sidebar contact card selection
  const handleSelectConversation = (targetRoomId: string, partnerName: string, partnerId: string) => {
    cleanupCall();

    if (socketRef.current) {
      socketRef.current.emit('leave-room', {
        roomId,
        name: `${user.firstName} ${user.lastName}`,
      });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setMessages([]);
    setRoomId(targetRoomId);
    setPeerName(partnerName);
    setPeerOnline(false);
    setPeerLastSeen(null);

    const socket = io('http://localhost:2800/telemedicine', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    // Load history
    socket.on('chat-history', (history: any[]) => {
      const formattedHistory = history.map((msg) => ({
        senderName: msg.senderName,
        text: msg.text,
        createdAt: msg.createdAt,
        attachmentType: msg.attachmentType || undefined,
        attachmentUrl: msg.attachmentUrl || undefined,
        fileName: msg.fileName || undefined,
      }));
      setMessages(formattedHistory);
    });

    socket.on('user-joined', (data) => {
      setPeerOnline(true);
      setPeerLastSeen(null);
      socket.emit('respond-online', {
        roomId: targetRoomId,
        name: `${user.firstName} ${user.lastName}`,
      });
    });

    socket.on('peer-online', (data) => {
      setPeerOnline(true);
      setPeerLastSeen(null);
      if (data.name) {
        setPeerName(data.name);
      }
    });

    socket.on('user-left', (data: { name: string; lastSeen: string }) => {
      setPeerOnline(false);
      const date = new Date(data.lastSeen);
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setPeerLastSeen(`Last seen today at ${formattedTime}`);
    });

    socket.on('receive-message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
      playNotificationSound();
    });

    socket.on('call-made', (data) => {
      setIncomingCallOffer(data);
    });

    socket.on('media-state-changed', (data: { type: 'video' | 'audio'; enabled: boolean }) => {
      if (data.type === 'video') {
        setRemoteVideoEnabled(data.enabled);
      } else if (data.type === 'audio') {
        setRemoteAudioEnabled(data.enabled);
      }
    });

    socket.emit('join-room', {
      roomId: targetRoomId,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
    });
  };

  // Start new custom chat session
  const handleStartCustomDoctorChat = (doc: any) => {
    const customRoomId = `chat_${user._id}_${doc._id}`;
    const docName = `Dr. ${doc.firstName} ${doc.lastName}`;
    
    // Add to local state list and persist
    const exists = customChats.some((c) => c.roomId === customRoomId);
    if (!exists) {
      const updated = [
        ...customChats,
        {
          roomId: customRoomId,
          partnerName: docName,
          partnerId: doc._id,
          specialization: doc.specialization,
          date: new Date().toISOString(),
        },
      ];
      setCustomChats(updated);
      localStorage.setItem(`custom_chats_${user._id}`, JSON.stringify(updated));
    }

    setShowNewChatModal(false);
    handleSelectConversation(customRoomId, docName, doc._id);
  };

  // ─── WebRTC Live Calling ───

  const handleInitiateCall = async () => {
    if (!socketRef.current) return;
    setIsCalling(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        }
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current?.addTrack(track);
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      let recipientId = '';
      if (roomId.startsWith('chat_')) {
        const parts = roomId.split('_');
        recipientId = parts[1] === user._id ? parts[2] : parts[1];
      }
      
      socketRef.current.emit('call-user', { roomId, offer, recipientId });

      socketRef.current.on('answer-made', async (data) => {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      });

      socketRef.current.on('ice-candidate-received', async (data) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Camera/mic access is required for calls.');
      setIsCalling(false);
    }
  };

  const handleAnswerCall = async () => {
    if (!socketRef.current || !incomingCallOffer) return;
    setIsCalling(true);
    const offerData = incomingCallOffer;
    setIncomingCallOffer(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        }
        event.streams[0].getTracks().forEach((track) => {
          remoteStreamRef.current?.addTrack(track);
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('make-answer', { roomId, answer });

      socketRef.current.on('ice-candidate-received', async (data) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error(e);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Camera/mic access is required to answer call.');
      setIsCalling(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent, attachment?: Partial<ChatMessage>) => {
    if (e) e.preventDefault();
    if (!socketRef.current) return;

    let recipientId = '';
    if (roomId.startsWith('chat_')) {
      const parts = roomId.split('_');
      recipientId = parts[1] === user._id ? parts[2] : parts[1];
    } else {
      const app = appointments.find((a) => a._id === roomId);
      if (app) {
        const opp = user.role === 'doctor' ? app.patient : app.doctor;
        recipientId = opp?._id || '';
      }
    }

    const baseMsg: ChatMessage = {
      senderName: `${user.firstName} ${user.lastName}`,
      text: chatInput.trim(),
      createdAt: new Date().toISOString(),
      ...attachment,
    };

    if (!baseMsg.text && !baseMsg.attachmentUrl) return;

    socketRef.current.emit('send-message', {
      roomId,
      recipientId,
      ...baseMsg,
    });

    setMessages((prev) => [...prev, baseMsg]);
    setChatInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleSendMessage(undefined, {
        attachmentType: type,
        attachmentUrl: dataUrl,
        fileName: file.name,
        text: type === 'image' ? 'Sent a photo' : `Sent a document: ${file.name}`,
      });
    };
    reader.readAsDataURL(file);
    setShowPlusMenu(false);
  };

  const handleStartVoiceRecording = async () => {
    voiceChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          handleSendMessage(undefined, {
            attachmentType: 'voice',
            attachmentUrl: dataUrl,
            text: 'Sent a voice note',
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecordingVoice(true);
      setShowPlusMenu(false);
    } catch (err) {
      console.error(err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const handleStopVoiceRecording = () => {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== 'inactive') {
      voiceRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const handleLeaveRoom = () => {
    cleanupCall();
    if (socketRef.current) {
      socketRef.current.emit('leave-room', {
        roomId,
        name: `${user.firstName} ${user.lastName}`,
      });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRoomId('');
    setMessages([]);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !videoEnabled));
      setVideoEnabled(!videoEnabled);
      socketRef.current?.emit('toggle-media', { roomId, type: 'video', enabled: !videoEnabled });
    }
  };

  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !audioEnabled));
      setAudioEnabled(!audioEnabled);
      socketRef.current?.emit('toggle-media', { roomId, type: 'audio', enabled: !audioEnabled });
    }
  };

  const formatMessageTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${time} • ${date}`;
    } catch (e) {
      return '';
    }
  };

  // Filter conversations list by search query
  const filteredAppointments = appointments.filter((app) => {
    const opposite = user.role === 'doctor' ? app.patient : app.doctor;
    if (!opposite) return false;
    const fullName = `${opposite.firstName} ${opposite.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const filteredCustomChats = customChats.filter((c) => {
    return c.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter global database directory list: Show matching doctors when searching, OR show all doctors if user has zero active chats
  const filteredDirectoryDoctors = user.role === 'patient'
    ? dbDoctors.filter((doc) => {
        const docName = `Dr. ${doc.firstName} ${doc.lastName}`.toLowerCase();
        
        // Show when search is matching, OR show all if the active chat list is completely empty
        const matchesSearch = searchQuery.trim() === ''
          ? (appointments.length === 0 && customChats.length === 0)
          : docName.includes(searchQuery.toLowerCase()) || (doc.specialization || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        // Exclude if already in active appointments
        const inAppointments = appointments.some((app) => {
          const doctorId = typeof app.doctor === 'object' ? app.doctor?._id : app.doctor;
          return doctorId === doc._id;
        });
        
        // Exclude if already in custom chats
        const inCustom = customChats.some((c) => c.partnerId === doc._id);
        
        return matchesSearch && !inAppointments && !inCustom;
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-6 relative">
      {/* Hidden File Inputs */}
      <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
      <input type="file" ref={docInputRef} accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />

      {/* Floating Background Notification Toast */}
      {bgNotification && (
        <div className="fixed right-6 top-6 z-50 bg-card border-l-4 border-l-primary border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in w-[320px]">
          <Bell className="h-5 w-5 text-primary animate-ring shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-foreground truncate">{bgNotification.senderName}</h4>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{bgNotification.text}</p>
          </div>
          <button onClick={() => setBgNotification(null)} className="h-6 w-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* New Chat Modal: List Verified Database Doctors */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewChatModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl z-10 flex flex-col h-[70vh] min-h-[400px]">
            <div className="flex justify-between items-center border-b border-border pb-3 shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Select Doctor to Chat
              </h3>
              <button onClick={() => setShowNewChatModal(false)} className="h-7 w-7 hover:bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Doctor Search input */}
            <div className="py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={doctorSearchQuery}
                  onChange={(e) => setDoctorSearchQuery(e.target.value)}
                  placeholder="Search doctor or specialty..."
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Doctors list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 p-1">
              {isLoadingDoctors ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredDoctors.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-10">No verified doctors found in database.</p>
              ) : (
                filteredDoctors.map((doc) => {
                  const initials = `${doc.firstName.charAt(0)}${doc.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <button
                      key={doc._id}
                      onClick={() => handleStartCustomDoctorChat(doc)}
                      className="w-full text-left p-3 rounded-2xl hover:bg-muted flex items-center gap-3 transition-colors border border-transparent hover:border-border/30"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground">Dr. {doc.firstName} {doc.lastName}</h4>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{doc.specialization} • {doc.city || 'Available'}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Web interface */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex h-[78vh] min-h-[500px]">
        
        {/* Left: WhatsApp Sidebar */}
        <div className="w-[300px] md:w-[350px] shrink-0 border-r border-border bg-muted/10 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user.firstName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs text-foreground truncate">{user.firstName} {user.lastName}</h3>
                <p className="text-[9px] text-muted-foreground capitalize font-semibold tracking-wide">{user.role}</p>
              </div>
            </div>
            
            {/* New Chat trigger (Patient Only) */}
            {user.role === 'patient' && (
              <Button size="icon" variant="ghost" onClick={handleOpenNewChat} className="h-9 w-9 rounded-full text-primary hover:bg-primary/5" title="New Chat with Database Doctor">
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-border bg-card shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search consult chats..."
                className="pl-9 h-9 text-xs rounded-xl shadow-none focus-visible:ring-1 bg-muted/30 border-none"
              />
            </div>
          </div>

          {/* Contacts List Scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-card">
            {isLoadingChats ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">Loading chats...</span>
              </div>
            ) : filteredAppointments.length === 0 && filteredCustomChats.length === 0 && filteredDirectoryDoctors.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground leading-relaxed p-4">
                No active consultation chats found. {user.role === 'patient' && 'Type any doctor\'s name in the search box above to start talking directly!'}
              </div>
            ) : (
              <>
                {/* Booked Appointment Chats */}
                {filteredAppointments.map((app) => {
                  const opposite = user.role === 'doctor' ? app.patient : app.doctor;
                  if (!opposite) return null;
                  const initials = `${opposite.firstName?.charAt(0) || ''}${opposite.lastName?.charAt(0) || ''}`.toUpperCase();
                  const isActive = roomId === app._id;

                  return (
                    <button
                      key={app._id}
                      onClick={() => handleSelectConversation(app._id, `${user.role === 'doctor' ? '' : 'Dr. '}${opposite.firstName} ${opposite.lastName}`, opposite._id)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                        isActive ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-xs truncate text-foreground">
                            {user.role === 'doctor' ? '' : 'Dr. '}{opposite.firstName} {opposite.lastName}
                          </h4>
                          <span className="text-[8px] text-muted-foreground font-semibold">
                            {new Date(app.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-muted-foreground truncate flex-1">
                            Slot: {app.slot}
                          </p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                            app.status === 'confirmed' ? 'text-blue-600 bg-blue-500/10' :
                            app.status === 'completed' ? 'text-emerald-600 bg-emerald-500/10' :
                            'text-amber-600 bg-amber-500/10'
                          }`}>
                            {app.status === 'confirmed' ? <CheckCircle className="h-2 w-2" /> : <Clock className="h-2 w-2" />}
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Custom Doctor-Patient Chats */}
                {filteredCustomChats.map((c) => {
                  const initials = c.partnerName.replace('Dr. ', '').split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase();
                  const isActive = roomId === c.roomId;

                  return (
                    <button
                      key={c.roomId}
                      onClick={() => handleSelectConversation(c.roomId, c.partnerName, c.partnerId)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                        isActive ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-xs truncate text-foreground">{c.partnerName}</h4>
                          <span className="text-[8px] text-muted-foreground font-semibold">
                            {new Date(c.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-muted-foreground truncate flex-1">
                            {c.specialization || 'General Consultation'}
                          </p>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-teal-600 bg-teal-500/10">
                            Direct Chat
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Directory Doctors matching search query */}
                {filteredDirectoryDoctors.length > 0 && (
                  <>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold px-3 py-2 mt-4 border-t border-border/40">
                      Doctors Directory (New Chat)
                    </div>
                    {filteredDirectoryDoctors.map((doc) => {
                      const initials = `${doc.firstName.charAt(0)}${doc.lastName.charAt(0)}`.toUpperCase();
                      const customRoomId = `chat_${user._id}_${doc._id}`;
                      const docName = `Dr. ${doc.firstName} ${doc.lastName}`;

                      return (
                        <button
                          key={doc._id}
                          onClick={() => {
                            // Add to custom chats
                            const exists = customChats.some((c) => c.roomId === customRoomId);
                            if (!exists) {
                              const updated = [
                                ...customChats,
                                {
                                  roomId: customRoomId,
                                  partnerName: docName,
                                  partnerId: doc._id,
                                  specialization: doc.specialization,
                                  date: new Date().toISOString(),
                                },
                              ];
                              setCustomChats(updated);
                              localStorage.setItem(`custom_chats_${user._id}`, JSON.stringify(updated));
                            }
                            handleSelectConversation(customRoomId, docName, doc._id);
                          }}
                          className="w-full text-left p-3 rounded-2xl hover:bg-muted flex items-center gap-3 transition-all border border-transparent hover:border-border/30"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-foreground">{docName}</h4>
                            <p className="text-[9px] text-muted-foreground truncate mt-0.5">{doc.specialization} • {doc.city || 'Available'}</p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: WhatsApp Main Conversation window */}
        <div className="flex-1 flex flex-col min-w-0 bg-card relative">
          
          {incomingCallOffer && (
            <div className="absolute inset-x-0 top-4 z-50 flex justify-center p-2">
              <div className="bg-card border border-border rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-bounce">
                <div>
                  <h4 className="font-bold text-xs">Incoming consultation video call</h4>
                  <p className="text-[10px] text-muted-foreground">Answer request to connect streams</p>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="outline" className="text-red-500 text-[10px]" onClick={() => setIncomingCallOffer(null)}>
                    Decline
                  </Button>
                  <Button size="xs" variant="gradient" className="text-[10px]" onClick={handleAnswerCall}>
                    Answer Call
                  </Button>
                </div>
              </div>
            </div>
          )}

          {roomId === '' ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-bold">DocAppoint WhatsApp Web</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Send and receive messages instantly. Select any doctor or patient appointment session on the left sidebar to start secure consulting.
                </p>
              </div>
            </div>
          ) : (
            /* Active Conversation chat box */
            <div className="flex-1 flex flex-col justify-between overflow-hidden h-full">
              
              {/* Plus attachment popup menu */}
              {showPlusMenu && (
                <div className="absolute bottom-16 left-6 z-20 bg-card border border-border rounded-2xl shadow-xl p-3 flex flex-col gap-2 min-w-[150px] animate-fade-in">
                  <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    Send Photo
                  </button>
                  <button onClick={() => docInputRef.current?.click()} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Send Document
                  </button>
                  <button onClick={handleStartVoiceRecording} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                    <Volume2 className="h-4 w-4 text-green-500" />
                    Record Voice
                  </button>
                </div>
              )}

              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs relative">
                    {peerName.charAt(0).toUpperCase()}
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card ${peerOnline ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs truncate text-foreground">{peerName}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {peerOnline ? 'Online' : peerLastSeen || 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Call & Leave actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {!isCalling && (
                    <Button size="icon" variant="outline" className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/5" onClick={handleInitiateCall} title="Start Video Call">
                      <VideoIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-500 rounded-xl" onClick={handleLeaveRoom}>
                    Close Chat
                  </Button>
                </div>
              </div>

              {/* Conversation layout (Chat + WebRTC Grid) */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Chat Message Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs min-h-0 bg-muted/5">
                  {messages.map((msg, index) => {
                    const isSystem = msg.senderName === 'System';
                    const isMe = msg.senderName === `${user.firstName} ${user.lastName}`;

                    return (
                      <div key={index} className={`flex flex-col ${isSystem ? 'items-center' : isMe ? 'items-end' : 'items-start'}`}>
                        {!isSystem && (
                          <span className="text-[9px] text-muted-foreground mb-1 font-semibold">
                            {msg.senderName}
                          </span>
                        )}

                        <div className={`max-w-[75%] rounded-2xl p-3 leading-relaxed flex flex-col gap-2 ${
                          isSystem
                            ? 'bg-blue-500/5 text-blue-600 border border-blue-500/10 text-center font-medium'
                            : isMe
                              ? 'bg-green-600 text-white rounded-tr-none'
                              : 'bg-muted text-foreground border border-border rounded-tl-none'
                        }`}>
                          {msg.text && <p>{msg.text}</p>}

                          {msg.attachmentType === 'image' && msg.attachmentUrl && (
                            <img src={msg.attachmentUrl} alt="content" className="max-w-[200px] max-h-[160px] rounded-xl object-cover border border-black/10 block mt-1" />
                          )}

                          {msg.attachmentType === 'document' && msg.attachmentUrl && (
                            <a href={msg.attachmentUrl} download={msg.fileName || 'document'} className="flex items-center gap-2 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-black/5 text-[11px] font-semibold text-current truncate max-w-[220px]">
                              <FileText className="h-5 w-5 shrink-0" />
                              <span className="truncate flex-1">{msg.fileName || 'file.pdf'}</span>
                            </a>
                          )}

                          {msg.attachmentType === 'voice' && msg.attachmentUrl && (
                            <audio src={msg.attachmentUrl} controls className="max-w-[220px] h-9 block rounded-lg filter invert dark:invert-0" />
                          )}

                          {!isSystem && (
                            <span className="text-[8px] self-end mt-1 opacity-70 block select-none">
                              {formatMessageTimestamp(msg.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Floating/Side WebRTC Window Panel */}
                {isCalling && (
                  <div className="w-[280px] border-l border-border bg-muted/20 p-4 flex flex-col gap-4 shrink-0 min-h-0 animate-fade-in">
                    <h3 className="font-bold text-xs border-b border-border pb-2">WebRTC Video Consult</h3>
                    
                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                      {/* Local Cam */}
                      <div className="relative rounded-2xl bg-black border border-border overflow-hidden h-[120px] shrink-0">
                        <video ref={localVideoRef} autoPlay muted playsInline className={`absolute inset-0 w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`} />
                        {!videoEnabled && (
                          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                            <VideoOff className="h-5 w-5 text-destructive" />
                            <span className="text-[9px] mt-1">Camera Off</span>
                          </div>
                        )}
                        {!audioEnabled && (
                          <span className="absolute top-2 right-2 bg-destructive/80 text-white p-1 rounded-full">
                            <MicOff className="h-3 w-3" />
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[8px] font-semibold text-white">
                          You
                        </span>
                      </div>

                      {/* Remote Cam */}
                      <div className="relative rounded-2xl bg-black border border-border overflow-hidden h-[120px] shrink-0">
                        <video ref={remoteVideoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover ${!remoteVideoEnabled ? 'hidden' : ''}`} />
                        {!remoteVideoEnabled && (
                          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                            <VideoOff className="h-5 w-5 text-destructive" />
                            <span className="text-[9px] mt-1">Camera Off</span>
                          </div>
                        )}
                        {!remoteAudioEnabled && (
                          <span className="absolute top-2 right-2 bg-destructive/80 text-white p-1 rounded-full">
                            <MicOff className="h-3 w-3" />
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[8px] font-semibold text-white">
                          {peerName}
                        </span>
                      </div>
                    </div>

                    {/* Call Controls */}
                    <div className="flex gap-2 border-t border-border pt-3 mt-auto shrink-0 justify-between">
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="icon" onClick={toggleCamera} className={`rounded-full h-9 w-9 ${!videoEnabled ? 'bg-destructive/10 border-destructive hover:bg-destructive/20 text-destructive' : ''}`}>
                          {videoEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={toggleMicrophone} className={`rounded-full h-9 w-9 ${!audioEnabled ? 'bg-destructive/10 border-destructive hover:bg-destructive/20 text-destructive' : ''}`}>
                          {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                      </div>

                      <Button variant="default" onClick={cleanupCall} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 text-xs px-4">
                        End Call
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input Panel */}
              <div className="p-4 border-t border-border flex gap-2 shrink-0 bg-card items-center h-16">
                <Button size="icon" variant="outline" className={`rounded-xl h-11 w-11 shrink-0 ${showPlusMenu ? 'bg-muted border-primary' : ''}`} onClick={() => setShowPlusMenu(!showPlusMenu)}>
                  <Plus className={`h-5 w-5 transition-transform duration-200 ${showPlusMenu ? 'rotate-45' : ''}`} />
                </Button>

                {isRecordingVoice ? (
                  <div className="flex-1 flex items-center justify-between bg-red-500/10 border border-red-200/50 text-red-600 rounded-xl h-11 px-4 animate-pulse">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <Circle className="h-2.5 w-2.5 fill-red-600 animate-ping" />
                      Recording voice...
                    </span>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-100" onClick={handleStopVoiceRecording}>
                      Stop & Send
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSendMessage(e)} className="flex-1 flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a WhatsApp message..."
                      className="flex-1 rounded-xl h-11 shadow-sm px-4 focus-visible:ring-1"
                      required
                    />
                    <Button type="submit" size="icon" className="rounded-xl h-11 w-11 shrink-0">
                      <Send className="h-4.5 w-4.5" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to trigger fetch on new chat click
  function handleOpenNewChat() {
    setShowNewChatModal(true);
    setIsLoadingDoctors(true);
    api.get('/doctors')
      .then((res) => {
        setDbDoctors(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingDoctors(false));
  }
}
