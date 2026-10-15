import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageSquare, Plus, Search, Send, Users, X, Circle } from 'lucide-react';
import { EASE, SPRING } from '../motion/presets';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'ingame' | 'online' | 'offline';
  game?: string;
  lastMessage?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'GhostRider',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    status: 'ingame',
    game: 'Left 4 Dead 2',
    lastMessage: 'Are we jumping into the campaign tonight?',
  },
  {
    id: 'f2',
    name: 'Valkyrie99',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'ingame',
    game: 'Counter-Strike 2',
    lastMessage: 'gg last match!',
  },
  {
    id: 'f3',
    name: 'CyberSamurai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'online',
    lastMessage: 'Check out the new launcher update, looks insane.',
  },
  {
    id: 'f4',
    name: 'PixelQueen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'offline',
    lastMessage: 'Catch you tomorrow!',
  },
];

const INITIAL_GROUPS = [
  { id: 'g1', name: 'Aevora Beta Club', members: 42, active: true },
  { id: 'g2', name: 'Co-op Survivors', members: 18, active: false },
  { id: 'g3', name: 'Indie Enthusiasts', members: 89, active: false },
];

export default function FriendChatOverlay({
  onClose,
  currentUserName = 'Andreh',
}: {
  onClose: () => void;
  currentUserName?: string;
}) {
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('f1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    f1: [
      {
        id: 'm1',
        senderId: 'f1',
        senderName: 'GhostRider',
        text: 'Hey! Are we jumping into the campaign tonight?',
        timestamp: '12:45 PM',
        isMe: false,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: currentUserName,
        text: 'Yes! Just updated the launcher with the new obsidian theme, it looks awesome.',
        timestamp: '12:48 PM',
        isMe: true,
      },
      {
        id: 'm3',
        senderId: 'f1',
        senderName: 'GhostRider',
        text: 'Sweet! Send an invite once you launch L4D2.',
        timestamp: '12:50 PM',
        isMe: false,
      },
    ],
    f2: [
      {
        id: 'm1',
        senderId: 'f2',
        senderName: 'Valkyrie99',
        text: 'gg last match! We clutched round 24.',
        timestamp: 'Yesterday',
        isMe: false,
      },
    ],
    f3: [
      {
        id: 'm1',
        senderId: 'f3',
        senderName: 'CyberSamurai',
        text: 'Check out the new launcher update, looks insane.',
        timestamp: '11:15 AM',
        isMe: false,
      },
    ],
  });

  const activeFriend = friends.find((f) => f.id === selectedFriendId) ?? friends[0];
  const activeChat = activeFriend ? messages[activeFriend.id] ?? [] : [];

  const handleSendMessage = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeFriend) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderId: 'me',
      senderName: currentUserName,
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeFriend.id]: [...(prev[activeFriend.id] ?? []), newMsg],
    }));
    setInputText('');

    // Simulate smart reply
    setTimeout(() => {
      const replies = [
        'Awesome, let me know when you are ready!',
        'Got it! See you in game in a bit.',
        'Sounds good bro!',
        'Nice! That works for me.',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg: ChatMessage = {
        id: String(Date.now() + 1),
        senderId: activeFriend.id,
        senderName: activeFriend.name,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages((prev) => ({
        ...prev,
        [activeFriend.id]: [...(prev[activeFriend.id] ?? []), replyMsg],
      }));
    }, 1200);
  };

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.game && f.game.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={SPRING.soft}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[620px] w-full max-w-[860px] overflow-hidden rounded-[26px] border border-white/10 bg-[#12141A] shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
      >
        {/* Left Column: Friends / Groups list */}
        <div className="flex w-[310px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0E1015]/90">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF6B2B] to-[#FFA043] font-bold text-white text-[13px] shadow-sm">
                  {currentUserName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0E1015]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white">{currentUserName}</span>
                <span className="text-[10px] font-medium text-emerald-400">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('friends')}
                className={`rounded-lg p-1.5 transition-colors ${
                  activeTab === 'friends' ? 'bg-white/10 text-[#FF6B2B]' : 'text-[#8E929E] hover:text-white'
                }`}
                title="Friends"
              >
                <Users size={16} />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('groups')}
                className={`rounded-lg p-1.5 transition-colors ${
                  activeTab === 'groups' ? 'bg-white/10 text-[#FF6B2B]' : 'text-[#8E929E] hover:text-white'
                }`}
                title="Groups"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-[#8E929E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'friends' ? 'Search friends...' : 'Search groups...'}
                className="w-full rounded-full border border-white/[0.08] bg-[#161922] py-1.5 pl-8 pr-3 text-[12px] text-white placeholder-[#8E929E]/60 focus:border-[#FF6B2B]/60 focus:outline-none"
              />
            </div>
          </div>

          {/* List content */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-2">
            {activeTab === 'friends' ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8E929E]/70">
                  Friends ({filteredFriends.length})
                </div>
                {filteredFriends.map((friend) => {
                  const isSelected = friend.id === selectedFriendId;
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => setSelectedFriendId(friend.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                        isSelected
                          ? 'bg-[#1D212B] text-white shadow-sm'
                          : 'text-[#8E929E] hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                        />
                        <span
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[#0E1015] ${
                            friend.status === 'ingame'
                              ? 'bg-emerald-400'
                              : friend.status === 'online'
                              ? 'bg-sky-400'
                              : 'bg-zinc-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-[12.5px] font-semibold text-white">
                            {friend.name}
                          </span>
                        </div>
                        <p className="truncate text-[11px] font-medium text-[#8E929E]">
                          {friend.status === 'ingame' ? (
                            <span className="text-emerald-400 font-semibold">{friend.game}</span>
                          ) : friend.status === 'online' ? (
                            'Online'
                          ) : (
                            'Offline'
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8E929E]/70">
                  Groups ({INITIAL_GROUPS.length})
                </div>
                {INITIAL_GROUPS.map((grp) => (
                  <div
                    key={grp.id}
                    className="flex items-center justify-between rounded-xl bg-[#161922] p-3 border border-white/[0.06]"
                  >
                    <div>
                      <h4 className="text-[12.5px] font-semibold text-white">{grp.name}</h4>
                      <span className="text-[10.5px] text-[#8E929E]">{grp.members} members</span>
                    </div>
                    <span className="rounded-full bg-[#FF6B2B]/20 text-[#FFA043] text-[10px] font-bold px-2 py-0.5">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation */}
        <div className="flex flex-1 flex-col bg-[#14171F]">
          {/* Top Chat Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 bg-[#14171F]">
            {activeFriend ? (
              <div className="flex items-center gap-3">
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.name}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
                />
                <div>
                  <h3 className="text-[14px] font-bold text-white">{activeFriend.name}</h3>
                  <p className="text-[11px] font-medium text-[#8E929E]">
                    {activeFriend.status === 'ingame' ? (
                      <span className="text-emerald-400 font-semibold">Playing {activeFriend.game}</span>
                    ) : activeFriend.status === 'online' ? (
                      'Online'
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#8E929E] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="no-scrollbar flex-1 overflow-y-auto p-5 space-y-3.5">
            {activeChat.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10.5px] font-bold text-[#8E929E]">{msg.senderName}</span>
                  <span className="text-[9.5px] text-[#8E929E]/60">{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[12.5px] leading-relaxed ${
                    msg.isMe
                      ? 'bg-gradient-to-r from-[#FF6B2B] to-[#FF4B14] text-white shadow-md'
                      : 'bg-[#1C202B] text-zinc-100 border border-white/[0.06]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div className="border-t border-white/[0.08] p-4 bg-[#12141A]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeFriend?.name ?? ''}...`}
                className="flex-1 rounded-full border border-white/[0.1] bg-[#1A1D27] px-4 py-2.5 text-[12.5px] text-white placeholder-[#8E929E]/60 focus:border-[#FF6B2B] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF4B14] text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
