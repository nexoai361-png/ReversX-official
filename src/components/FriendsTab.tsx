import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { motion, AnimatePresence } from 'motion/react';
import { useIcons } from '../lib/icons';

interface Message {
  id: string;
  sender: 'me' | 'friend';
  text?: string;
  file?: {
    name: string;
    type: string;
    data: string; // base64
  };
  timestamp: number;
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export const FriendsTab: React.FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const { 
    Send, Paperclip, ImageIcon, User, Search, MoreVertical, Copy, Check, Plus, MessageSquare, 
    Lock, CheckCheck, ChevronLeft, X, Play, Trash2, Mic, Square, Pause, Video
  } = useIcons();
  const [myId, setMyId] = useState<string>('');
  const [friendIdInput, setFriendIdInput] = useState('');
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Multimedia states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingCancelledRef = useRef<boolean>(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const connections = useRef<Record<string, DataConnection>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      setMyId(id);
      setPeer(newPeer);
    });

    newPeer.on('connection', (conn) => {
      setupConnection(conn);
    });

    return () => {
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeFriend]);

  const setupConnection = (conn: DataConnection) => {
    conn.on('open', () => {
      connections.current[conn.peer] = conn;
      
      setFriends(prev => {
        if (prev.find(f => f.id === conn.peer)) {
          return prev.map(f => f.id === conn.peer ? { ...f, status: 'online' } : f);
        }
        return [...prev, { id: conn.peer, name: `Friend ${conn.peer.slice(0, 4)}`, status: 'online', unreadCount: 0 }];
      });
    });

    conn.on('data', (data: any) => {
      const msg = data as Message;
      setMessages(prev => ({
        ...prev,
        [conn.peer]: [...(prev[conn.peer] || []), { ...msg, sender: 'friend' }]
      }));

      setFriends(prev => prev.map(f => {
        if (f.id === conn.peer) {
          return {
            ...f,
            lastMessage: msg.text || (msg.file ? `File: ${msg.file.name}` : ''),
            lastMessageTime: msg.timestamp,
            unreadCount: activeFriend?.id === conn.peer ? 0 : f.unreadCount + 1
          };
        }
        return f;
      }));
    });

    conn.on('close', () => {
      setFriends(prev => prev.map(f => f.id === conn.peer ? { ...f, status: 'offline' } : f));
      delete connections.current[conn.peer];
    });
  };

  const connectToFriend = () => {
    if (!peer || !friendIdInput.trim() || friendIdInput === myId) return;
    
    setIsConnecting(true);
    const conn = peer.connect(friendIdInput);
    setupConnection(conn);
    
    // Timeout for connection
    setTimeout(() => {
      setIsConnecting(false);
      setFriendIdInput('');
    }, 2000);
  };

  const sendMessage = (customFile?: { name: string, type: string, data: string }) => {
    if (!activeFriend) return;
    if (!inputText.trim() && !customFile && !isRecording) return;
    
    const conn = connections.current[activeFriend.id];
    if (!conn) return;

    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      sender: 'me',
      text: inputText.trim() || undefined,
      file: customFile,
      timestamp: Date.now()
    };

    conn.send(msg);
    setMessages(prev => ({
      ...prev,
      [activeFriend.id]: [...(prev[activeFriend.id] || []), msg]
    }));
    
    setFriends(prev => prev.map(f => {
      if (f.id === activeFriend.id) {
        return { 
          ...f, 
          lastMessage: msg.text || (msg.file ? `File: ${msg.file.name}` : ''), 
          lastMessageTime: msg.timestamp 
        };
      }
      return f;
    }));
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeFriend) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      sendMessage({
        name: file.name,
        type: file.type,
        data: base64
      });
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // If it was cancelled (not isRecording), chunks might be empty or we don't want them
        if (chunks.length > 0 && !isRecordingCancelledRef.current) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result as string;
            sendMessage({
              name: 'Voice Message.webm',
              type: 'audio/webm',
              data: base64data
            });
          };
          reader.readAsDataURL(audioBlob);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      isRecordingCancelledRef.current = false;
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setErrorMsg("Microphone access denied. Please allow microphone permissions in your browser settings.");
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyMyId = () => {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Friends List Sidebar */}
      <div className={`w-full md:w-80 border-r border-border flex-col bg-sidebar ${activeFriend ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Friends</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyMyId}
                className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/60"
                title="Copy My Peer ID"
              >
                {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          
          <div className="bg-foreground/5 p-2 rounded-lg flex items-center gap-2">
            <Search size={16} className="text-foreground/40" />
            <input 
              type="text" 
              placeholder="Enter Friend ID..." 
              className="bg-transparent border-none outline-none text-sm text-foreground w-full"
              value={friendIdInput}
              onChange={(e) => setFriendIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connectToFriend()}
            />
            <button 
              onClick={connectToFriend}
              disabled={isConnecting || !friendIdInput.trim()}
              className="p-1 hover:bg-accent/20 text-accent rounded transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="text-[10px] text-foreground/30 uppercase tracking-widest font-bold">
            My ID: <span className="text-accent/60 select-all">{myId || 'Initializing...'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-foreground/20 p-6 text-center">
              <User size={40} strokeWidth={1} className="mb-2" />
              <p className="text-xs">No friends yet. Share your ID to start chatting!</p>
            </div>
          ) : (
            friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => {
                  setActiveFriend(friend);
                  setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, unreadCount: 0 } : f));
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-foreground/5 transition-colors border-b border-border/5 ${activeFriend?.id === friend.id ? 'bg-accent/10' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <User size={24} />
                  </div>
                  {friend.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-sidebar rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">{friend.name}</span>
                    {friend.lastMessageTime && (
                      <span className="text-[10px] text-foreground/40">
                        {new Date(friend.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground/50 truncate">
                      {friend.lastMessage || 'Start a conversation'}
                    </p>
                    {friend.unreadCount > 0 && (
                      <span className="bg-accent text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {friend.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col bg-background relative ${activeFriend ? 'flex' : 'hidden md:flex'}`}>
        {activeFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/50 backdrop-blur-sm sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveFriend(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/60"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{activeFriend.name}</h3>
                  <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">
                    {activeFriend.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-foreground/40">
                <button className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                  <Search size={18} />
                </button>
                <button className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://picsum.photos/seed/chat/1920/1080?blur=10')] bg-fixed bg-cover bg-center">
              <div className="absolute inset-0 bg-background/90 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                {/* E2EE Notice */}
                <div className="flex justify-center mb-6">
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 px-4 py-2 rounded-lg flex items-center gap-2 max-w-[280px] shadow-sm">
                    <Lock size={10} className="text-accent/60" />
                    <p className="text-[9px] text-foreground/40 text-center leading-tight">
                      Messages are end-to-end encrypted. No one outside of this chat can read them.
                    </p>
                  </div>
                </div>

                {(messages[activeFriend.id] || []).map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                      msg.sender === 'me' 
                        ? 'bg-accent text-background rounded-tr-none' 
                        : 'bg-sidebar border border-border text-foreground rounded-tl-none'
                    }`}>
                      {msg.file && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          {msg.file.type.startsWith('image/') ? (
                            <img 
                              src={msg.file.data} 
                              alt={msg.file.name} 
                              className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              referrerPolicy="no-referrer"
                              onClick={() => setSelectedImage(msg.file!.data)}
                            />
                          ) : msg.file.type.startsWith('video/') ? (
                            <video 
                              src={msg.file.data} 
                              controls 
                              className="max-w-full h-auto rounded-lg"
                            />
                          ) : msg.file.type.startsWith('audio/') ? (
                            <div className="flex items-center gap-3 bg-foreground/5 p-2 rounded-lg min-w-[200px]">
                              <audio src={msg.file.data} controls className="h-8 max-w-full w-full" />
                            </div>
                          ) : (
                            <a 
                              href={msg.file.data} 
                              download={msg.file.name}
                              className="flex items-center gap-2 p-2 bg-foreground/10 rounded-lg text-xs hover:bg-foreground/20 transition-colors"
                            >
                              <Paperclip size={14} />
                              <span className="truncate">{msg.file.name}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>}
                      <div className={`flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px]`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.sender === 'me' && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-sidebar/50 backdrop-blur-sm border-t border-border">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex items-center gap-1">
                  {!isRecording ? (
                    <>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-full transition-all"
                      >
                        <Paperclip size={20} />
                      </button>
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload}
                        accept="image/*,video/*,audio/*"
                      />
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        isRecordingCancelledRef.current = true;
                        if (mediaRecorder) {
                          mediaRecorder.stop();
                        }
                        setIsRecording(false);
                        if (timerRef.current) clearInterval(timerRef.current);
                      }}
                      className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                
                <div className="flex-1 relative flex items-center">
                  {isRecording ? (
                    <div className="flex-1 bg-accent/10 border border-accent/20 rounded-2xl py-3 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-accent">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-medium">Recording Voice Message... {formatTime(recordingTime)}</span>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter to send disabled per user request
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-foreground/5 border border-border rounded-2xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-accent transition-all resize-none max-h-32 custom-scrollbar"
                      rows={1}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!inputText.trim() && !isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="p-3 bg-foreground/5 text-foreground/60 rounded-full hover:bg-accent/10 hover:text-accent transition-all shadow-sm"
                    >
                      <Mic size={20} />
                    </button>
                  ) : isRecording ? (
                    <button 
                      onClick={stopRecording}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg animate-pulse"
                    >
                      <Square size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => sendMessage()}
                      className="p-3 bg-accent text-background rounded-full hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                    >
                      <Send size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Lightbox */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <button 
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X size={24} />
                  </button>
                  <motion.img 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                    referrerPolicy="no-referrer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground/20 p-10 text-center">
            <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
              <MessageSquare size={48} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-medium text-foreground/40 mb-2">ReversX Friends</h3>
            <p className="max-w-xs text-sm">
              Select a friend from the sidebar to start chatting or enter a Peer ID to connect.
            </p>
            <div className="mt-8 p-4 border border-dashed border-border rounded-xl bg-foreground/[0.02]">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2">Your Connection ID</p>
              <div className="flex items-center gap-3">
                <code className="text-accent font-mono text-lg">{myId || '...'}</code>
                <button onClick={copyMyId} className="p-2 hover:bg-accent/10 rounded-lg text-accent transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
