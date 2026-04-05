import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Smart mock AI responses based on keywords
function generateAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('hypo') || msg.includes('low glucose') || msg.includes('low blood sugar')) {
    return "Hypoglycemia occurs when blood glucose drops below 70 mg/dL. Common symptoms include shakiness, sweating, and confusion. I recommend consuming 15g of fast-acting carbohydrates (like juice or glucose tablets) and rechecking in 15 minutes. Based on your current trajectory, your risk is manageable — but stay alert.";
  }
  if (msg.includes('insulin') && (msg.includes('dose') || msg.includes('much') || msg.includes('take'))) {
    return "Insulin dosing depends on your current glucose level, carb intake, and activity. Based on your recent input data: with a glucose of ~120 mg/dL and moderate carb intake, a dose of 3-5 units of rapid-acting insulin is typical. Always consult your endocrinologist for personalized guidance.";
  }
  if (msg.includes('eat') || msg.includes('food') || msg.includes('meal') || msg.includes('snack') || msg.includes('carb')) {
    return "For stable glucose management, I recommend balanced meals with complex carbohydrates (whole grains, legumes), lean protein, and healthy fats. If your glucose is trending low, a quick 15-20g carb snack like a banana or crackers can help. Avoid high-glycemic foods before bed.";
  }
  if (msg.includes('exercise') || msg.includes('workout') || msg.includes('activity') || msg.includes('walk')) {
    return "Physical activity generally lowers blood glucose by increasing insulin sensitivity. For moderate exercise (30-60 min), consider reducing your pre-exercise insulin by 20-30% or having a 15g carb snack beforehand. Monitor glucose before, during, and after exercise. Your current activity level shows a manageable metabolic state.";
  }
  if (msg.includes('predict') || msg.includes('forecast') || msg.includes('trajectory') || msg.includes('trend')) {
    return "Based on your current parameters — glucose at ~120 mg/dL with moderate insulin on board — your 4-hour trajectory shows a gradual decline staying within safe range (80-140 mg/dL). The simulation accounts for your recent meal absorption and insulin activity curves. No immediate intervention needed.";
  }
  if (msg.includes('risk') || msg.includes('danger') || msg.includes('warning') || msg.includes('alert')) {
    return "Your current risk assessment is LOW (22%). The causal pathway analysis shows insulin as the primary driver (60%) with meal deficit contributing 30%. No escalation triggers are active. I'll continue monitoring and alert you if the projected curve approaches the 70 mg/dL threshold.";
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm DiaEase AI, your metabolic health assistant. I can help you understand your glucose predictions, explain risk factors, suggest dietary adjustments, and guide insulin management. What would you like to know?";
  }
  if (msg.includes('thank')) {
    return "You're welcome! Remember, I'm here 24/7 to help monitor your metabolic health. Don't hesitate to ask about glucose trends, meal planning, or insulin adjustments. Stay healthy! 💛";
  }
  if (msg.includes('help') || msg.includes('what can you')) {
    return "I can assist with:\n• Glucose trajectory interpretation\n• Insulin dosing guidance\n• Meal and carb recommendations\n• Exercise impact analysis\n• Risk level explanations\n• Hypoglycemia prevention tips\n\nJust ask me anything about your metabolic health!";
  }

  // Default contextual response
  const defaults = [
    "Based on your current metabolic profile, your glucose levels appear stable. Your insulin-on-board is being effectively utilized. Would you like me to run a specific scenario simulation?",
    "I've analyzed your recent data points. Your glucose trend is steady with no immediate risk flags. The prediction model shows you'll stay within range for the next 2 hours. Would you like dietary recommendations?",
    "Your metabolic passport shows consistent patterns over recent sessions. I notice your post-meal spikes are well-controlled. Keep up the current routine! Is there anything specific you'd like me to analyze?",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'ai',
      text: "Hi! I'm DiaEase AI 🧬 — your personal metabolic health assistant. Ask me about glucose predictions, insulin guidance, or meal recommendations.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay (800-2000ms)
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: generateAIResponse(userMsg.text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-white/10 border border-white/20 rotate-90'
            : 'bg-gradient-to-br from-[#060B14] to-black border border-white/20 shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg
            className="w-6 h-6 text-[#d4af37] group-hover:animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[600px] rounded-3xl overflow-hidden flex flex-col border border-white/10"
            style={{
              background: 'rgba(6, 11, 20, 0.92)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.1)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-yellow-600 flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
                <Sparkles className="w-5 h-5 text-[#060B14]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">DiaEase AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
                  <span className="text-[11px] text-gray-400">Online • On-device</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[350px] max-h-[420px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'ai'
                        ? 'bg-[#d4af37]/20 text-[#d4af37]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'ai'
                        ? 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-md'
                        : 'bg-[#d4af37]/20 text-white border border-[#d4af37]/20 rounded-tr-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <p className={`text-[10px] mt-1.5 ${msg.role === 'ai' ? 'text-gray-500' : 'text-[#d4af37]/50'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#d4af37]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#d4af37]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#d4af37]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-[#d4af37]/30 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your glucose, insulin, meals..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-[#d4af37] hover:bg-[#e6c86a] disabled:opacity-30 disabled:hover:bg-[#d4af37] transition-colors"
                >
                  <Send className="w-4 h-4 text-[#060B14]" />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-600 mt-2">
                AI-powered • Responses are for informational purposes only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
