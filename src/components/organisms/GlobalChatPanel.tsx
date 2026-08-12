import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { MessageSquare, Send, Globe, Users, Bot, AtSign, Sparkles, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMsg {
  id: string;
  sender_username: string;
  sender_title?: string;
  is_ai_bot?: boolean;
  content: string;
  created_at: string;
  mentioned_user?: string;
}

const ONLINE_PLAYERS = [
  { username: 'MustafaÖztürk', title: 'Vatandaş' },
  { username: 'Burak_CEO', title: 'Global Finans İmparatoru' },
  { username: 'Zeynep_Emlak', title: 'Gayrimenkul Krallığı Başkanı' },
  { username: 'Ahmet_Kaya99', title: 'Kripto Balinası' },
  { username: 'Elif_Yazilim', title: 'Senior Dev' },
  { username: 'Caner_Oto', title: 'Oto Galeri Sahibi' },
];

export const GlobalChatPanel: React.FC = () => {
  const { user, addToast, t } = useStore();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', sender_username: 'Burak_CEO', sender_title: 'Global Finans İmparatoru', is_ai_bot: false, content: 'NecoAI Labs bünyesine Senior Yazılımcı arıyoruz. @MustafaÖztürk başvursun!', created_at: '14:20', mentioned_user: 'MustafaÖztürk' },
    { id: '2', sender_username: 'Zeynep_Emlak', sender_title: 'Gayrimenkul Krallığı Başkanı', is_ai_bot: false, content: 'Moda sahilindeki deniz manzaralı daireyi satın alan var mı?', created_at: '14:22' },
    { id: '3', sender_username: 'AI_Trader_Bot', sender_title: '🤖 Otonom Borsa Botu', is_ai_bot: true, content: 'Bitcoin (BTC) balina cüzdan sinyali tespit edildi! %15 yükseliş bekleniyor.', created_at: '14:25' },
    { id: '4', sender_username: 'Ahmet_Kaya99', sender_title: 'Kripto Balinası', is_ai_bot: false, content: 'Borsa ve kripto portföylerini güncelleyin @Burak_CEO 🚀', created_at: '14:28', mentioned_user: 'Burak_CEO' }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // REALTIME WEBSOCKET / SIMULATION MESSAGE BROADCASTER
  useEffect(() => {
    const aiMessages = [
      { sender: 'AI_Market_Bot', title: '🤖 Otonom İlan Botu', text: 'Araç pazarına 6 yeni ekspertiz onaylı lüks otomobil eklendi @MustafaÖztürk!', mention: 'MustafaÖztürk' },
      { sender: 'Elif_Yazilim', title: 'Senior Dev', text: 'Yeraltı müzayedelerinde yeni Bugatti Chiron teklifi var mı?' },
      { sender: 'Caner_Oto', title: 'Oto Galeri Sahibi', text: 'Galeriye yeni kiralık VIP minibüsler geldi. Günlük pasif kira yüksek!' }
    ];

    const interval = setInterval(() => {
      const randomMsg = aiMessages[Math.floor(Math.random() * aiMessages.length)];
      const newMsg: ChatMsg = {
        id: 'msg-' + Date.now(),
        sender_username: randomMsg.sender,
        sender_title: randomMsg.title,
        is_ai_bot: randomMsg.sender.includes('Bot'),
        content: randomMsg.text,
        created_at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        mentioned_user: randomMsg.mention
      };

      setMessages(prev => [...prev, newMsg]);

      // Pop-up Alert Modal for Every Message
      addToast({
        type: randomMsg.mention ? 'warning' : 'info',
        title: randomMsg.mention ? '📢 Etiketlendiniz! (@Mention)' : `💬 Yeni Mesaj: ${randomMsg.sender}`,
        message: randomMsg.text
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [addToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    const lastChar = val.slice(-1);
    if (lastChar === '@') {
      setShowMentionMenu(true);
      setMentionFilter('');
    } else if (showMentionMenu) {
      const atIndex = val.lastIndexOf('@');
      if (atIndex !== -1) {
        setMentionFilter(val.slice(atIndex + 1));
      } else {
        setShowMentionMenu(false);
      }
    }
  };

  const handleSelectMention = (username: string) => {
    const atIndex = inputMessage.lastIndexOf('@');
    if (atIndex !== -1) {
      const newText = inputMessage.slice(0, atIndex) + `@${username} `;
      setInputMessage(newText);
    }
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const mentionMatch = inputMessage.match(/@(\w+)/);
    const mentionedUser = mentionMatch ? mentionMatch[1] : undefined;

    const newMsg: ChatMsg = {
      id: 'msg-user-' + Date.now(),
      sender_username: user?.username || 'MustafaÖztürk',
      sender_title: user?.title || 'Vatandaş',
      is_ai_bot: false,
      content: inputMessage.trim(),
      created_at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      mentioned_user: mentionedUser
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setShowMentionMenu(false);

    // Toast alert on sent message
    addToast({
      type: 'success',
      title: 'Mesaj Gönderildi 💬',
      message: mentionedUser ? `@${mentionedUser} kullanıcısına etiketli mesaj iletildi.` : 'Genel sohbete mesajınız yayınlandı.'
    });
  };

  const filteredOnlinePlayers = ONLINE_PLAYERS.filter(p =>
    p.username.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card variant="gold" className="border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{t('tab_chat')}</h2>
                <Badge variant="gold">REALTIME CHAT</Badge>
              </div>
            </div>
          </div>

          <Badge variant="emerald" className="py-1.5 px-3.5 text-xs font-black">
            🟢 1,420 ONLINE PLAYERS
          </Badge>
        </div>
      </Card>

      {/* CHAT MESSAGES WINDOW */}
      <Card className="border-slate-800 bg-slate-950 p-5 flex flex-col h-[520px] relative">
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-none">
          {messages.map((msg) => {
            const isMe = msg.sender_username === (user?.username || 'MustafaÖztürk');
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-white">{msg.sender_username}</span>
                  {msg.sender_title && (
                    <Badge variant={msg.is_ai_bot ? 'purple' : 'gold'} className="text-[9px]">
                      {msg.sender_title}
                    </Badge>
                  )}
                  <span className="text-[10px] font-semibold text-slate-500">{msg.created_at}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-lg text-xs font-semibold leading-relaxed border shadow-md ${
                    isMe
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 rounded-tr-none'
                      : msg.is_ai_bot
                      ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 rounded-tl-none'
                      : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* @MENTION POPUP MENU */}
        <AnimatePresence>
          {showMentionMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-16 left-5 right-5 bg-slate-900 border-2 border-amber-400 rounded-2xl p-2 shadow-2xl z-50 max-h-48 overflow-y-auto"
            >
              <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5" /> MENTION PLAYERS
                </span>
                <span className="text-[10px] text-slate-400">@...</span>
              </div>

              <div className="divide-y divide-slate-800/60 mt-1">
                {filteredOnlinePlayers.map((p) => (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectMention(p.username)}
                    className="w-full text-left px-3 py-2 hover:bg-amber-500/20 rounded-xl flex justify-between items-center transition-all cursor-pointer"
                  >
                    <span className="text-xs font-black text-white">@{p.username}</span>
                    <span className="text-[10px] font-bold text-slate-400">{p.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHAT INPUT FORM */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message (@ to mention)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          />
          <Button variant="gold" className="px-5 py-3 text-xs font-black">
            <Send className="w-4 h-4 mr-1 text-slate-950" /> Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
