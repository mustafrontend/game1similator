import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { MessageSquare, Send, AtSign, User, Bot, Sparkles, ShieldCheck, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMsg {
  id: string;
  sender_username: string;
  sender_title: string;
  is_ai_bot?: boolean;
  content: string;
  created_at: string;
  mentioned_user?: string;
}

const ONLINE_PLAYERS = [
  { username: 'Apple Oyuncusu', title: 'Vatandaş' },
  { username: 'Burak_CEO', title: 'Global Finans İmparatoru' },
  { username: 'Zeynep_Emlak', title: 'Gayrimenkul Krallığı Başkanı' },
  { username: 'Ahmet_Kaya99', title: 'Kripto Balinası' },
  { username: 'Elif_Yazilim', title: 'Senior Dev' },
  { username: 'Caner_Oto', title: 'Oto Galeri Sahibi' },
];

export const GlobalChatPanel: React.FC = () => {
  const { user, addToast, t } = useStore();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', sender_username: 'Burak_CEO', sender_title: 'Global Finans İmparatoru', is_ai_bot: false, content: 'NecoAI Labs bünyesine Senior Yazılımcı arıyoruz. @Apple Oyuncusu başvursun!', created_at: '14:20', mentioned_user: 'Apple Oyuncusu' },
    { id: '2', sender_username: 'Zeynep_Emlak', sender_title: 'Gayrimenkul Krallığı Başkanı', is_ai_bot: false, content: 'Moda sahilindeki deniz manzaralı daireyi satın alan var mı?', created_at: '14:22' },
    { id: '3', sender_username: 'AI_Trader_Bot', sender_title: '🤖 Otonom Borsa Botu', is_ai_bot: true, content: 'Bitcoin (BTC) balina cüzdan sinyali tespit edildi! %15 yükseliş bekleniyor.', created_at: '14:25' },
    { id: '4', sender_username: 'Ahmet_Kaya99', sender_title: 'Kripto Balinası', is_ai_bot: false, content: 'Borsa ve kripto portföylerini güncelleyin @Burak_CEO 🚀', created_at: '14:28', mentioned_user: 'Burak_CEO' }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Periodic AI Bot Chat Interactions
  useEffect(() => {
    const botInterval = setInterval(() => {
      const botMessages = [
        { sender: 'AI_Trader_Bot', title: '🤖 Borsa Sinyal Botu', text: 'BIST 100 Endeksinde hacim artışı! Enerji ve banka hisseleri yükselişte.' },
        { sender: 'AI_RealEstate_Bot', title: '🤖 Emlak Radar Botu', text: 'Karaköy sahilinde yeni açık artırma ilanları yayında!' },
        { sender: 'AI_Market_Bot', title: '🤖 Otonom İlan Botu', text: 'Araç pazarına 6 yeni ekspertiz onaylı lüks otomobil eklendi!' }
      ];

      const randomBotMsg = botMessages[Math.floor(Math.random() * botMessages.length)];
      const newMsg: ChatMsg = {
        id: 'msg-bot-' + Date.now(),
        sender_username: randomBotMsg.sender,
        sender_title: randomBotMsg.title,
        is_ai_bot: true,
        content: randomBotMsg.text,
        created_at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newMsg]);
    }, 45000);

    return () => clearInterval(botInterval);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);

    const lastWord = val.split(' ').pop();
    if (lastWord && lastWord.startsWith('@')) {
      setShowMentionMenu(true);
      setMentionFilter(lastWord.substring(1));
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (username: string) => {
    const words = inputMessage.split(' ');
    words.pop();
    setInputMessage([...words, `@${username} `].join(' '));
    setShowMentionMenu(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const mentionMatch = inputMessage.match(/@(\w+)/);
    const mentionedUser = mentionMatch ? mentionMatch[1] : undefined;

    const newMsg: ChatMsg = {
      id: 'msg-user-' + Date.now(),
      sender_username: user?.username || 'Apple Oyuncusu',
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
            const isMe = msg.sender_username === (user?.username || 'Apple Oyuncusu');
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-black text-white">{msg.sender_username}</span>
                  <Badge variant={msg.is_ai_bot ? 'purple' : isMe ? 'gold' : 'sky'} className="text-[9px] py-0 px-1.5">
                    {msg.sender_title}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-500">{msg.created_at}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-lg text-xs font-semibold leading-relaxed border shadow-md ${
                    isMe
                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-100 rounded-tr-none'
                      : msg.is_ai_bot
                      ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 rounded-tl-none'
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

        {/* AT-SIGN MENTION DROPDOWN POPUP */}
        {showMentionMenu && filteredOnlinePlayers.length > 0 && (
          <div className="absolute bottom-16 left-5 right-5 bg-slate-900 border border-amber-400/50 rounded-2xl p-2 shadow-2xl z-20 space-y-1">
            <p className="text-[10px] font-black text-amber-400 px-3 py-1 uppercase tracking-wider">Oyuncu Etiketle (@Mention)</p>
            {filteredOnlinePlayers.map((p) => (
              <button
                key={p.username}
                onClick={() => handleSelectMention(p.username)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-xl flex justify-between items-center text-xs text-white font-bold transition-all"
              >
                <span>@{p.username}</span>
                <span className="text-[10px] font-normal text-slate-400">{p.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* INPUT SEND FORM */}
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-3 border-t border-slate-900">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Mesajınızı yazın... (Oyuncu etiketlemek için @ yazın)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          />
          <Button variant="gold" size="sm" type="submit">
            <Send className="w-4 h-4 mr-1 text-slate-950" /> Gönder
          </Button>
        </form>
      </Card>
    </div>
  );
};
