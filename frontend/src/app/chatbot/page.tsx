'use client';
import React, { useState } from 'react';
import { Bot, Loader2, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// const fadeInUp = {
//   initial: { y: 20, opacity: 0 },
//   animate: { y: 0, opacity: 1 },
//   transition: { duration: 0.5 }
// };

// const staggerContainer = {
//   animate: {
//     transition: {
//       staggerChildren: 0.4
//     }
//   }
// };

// const shimmerAnimation = {
//   initial: { x: '-100%' },
//   animate: { 
//     x: '100%',
//     transition: {
//       repeat: Infinity,
//       duration: 1.5,
//       ease: "linear"
//     }
//   }
// };

// const loadingPhrases = [
//   {text: "Scanning Amazon reviews...", icon: <Sparkles className="w-6 h-6 text-white" />},
//   {text: "Analyzing product ratings...", icon: <Search className="w-6 h-6 text-white" />},
//   {text: "Gathering specifications...", icon: <Bot className="w-6 h-6 text-white" />},
//   {text: "Processing review data...", icon:<Star className="w-6 h-6 text-white" /> },
//   {text: "Almost there...", icon:<ClipboardCheck className="w-6 h-6 text-white" /> }
// ];

export default function App() {
  const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: { text: string; type: 'user' | 'bot' } = { text: input, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.reply, type: 'bot' }]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [...prev, { text: 'Error fetching response. Try again.', type: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black">
      <div className="container mx-auto md:px-4 lg:px-8 py-8">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-between items-center mb-8 lg:mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center space-x-3"
          >
            <Link href="/" className="flex items-center space-x-3">
              <Bot className="w-16 h-16 lg:w-8 lg:h-8 text-pink-500" />
              <span className="text-2xl lg:text-xl mt-2 lg:mt-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                GadgetGlimpse
              </span>
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hidden lg:block"
          >
            <Link
              href="/"
              className="group bg-gradient-to-r from-purple-700 to-pink-700 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg inline-flex items-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back Home
            </Link>
          </motion.div>
        </motion.nav>

        <div className="w-full text-white flex flex-col items-center justify-center lg:px-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full  rounded-xl shadow-lg p-6 flex flex-col h-[80vh]"
      > 

        <div className="flex-1 overflow-y-auto space-y-3 p-2 border border-gray-700 rounded-md">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-lg w-fit max-w-xs ${msg.type === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'}`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start bg-gray-700 p-3 rounded-lg"
            >
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </motion.div>
          )}
        </div>

        <div className="flex items-center mt-4">
        <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg outline-none"
        placeholder="Type a message..."
        />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={loading}
            className="ml-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
      </div>
    </main>
  );
}