'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, ArrowLeft, Send, XCircle, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function App() {
  const [messages, setMessages] = useState<{ text: string | React.JSX.Element; type: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  interface BotResponse {
    review?: {
      overview: string;
      key_features: string[];
      performance: Record<string, string>;
      pros: string[];
      cons: string[];
      final_rating: number;
    };
    product?: string;
    reply?: string;
  }
//   const temp = {
//     "Design": "Apple's products are known for their sleek and modern design. The use of high-quality materials and meticulous attention to detail have made Apple products a status symbol for many consumers.",
//     "Hardware ": "Apple's hardware is engineered for speed and efficiency, making its devices perform tasks quickly and reliably. The A-series processors used in iPhones and iPads are renowned for their power and performance, and the MacBook Pro can handle even the most demanding tasks with ease.",
//     "Software Performance": "Apple's software is optimized to work seamlessly with its hardware, resulting in impressive performance. The MacOS and iOS operating systems are known for their stability, smoothness, and ease of use."
// };
  const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 !== 0; // Check if there's a half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Calculate empty stars

    return (
      <div className="flex items-center mt-4">
        <span className="mr-2 font-bold text-gray-300">{rating}/5</span>
        {Array.from({ length: fullStars }, (_, index) => (
          <Star key={`full-${index}`} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
        ))}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
          <Star className="absolute w-5 h-5 fill-yellow-500  text-yellow-500" />
          <Star className="absolute w-5 h-5 fill-gray-800 text-gray-400" style={{ clipPath: 'inset(0 0 0 50%)' }} />
        </div>
        )} 
        {Array.from({ length: emptyStars }, (_, index) => (
          <Star key={`empty-${index}`} className="w-5 h-5 fill-gray-800 text-gray-400" />
        ))}
      </div>
    );
  };
  const formatBotResponse = (data: BotResponse) => {
    if (!data.review) return data.reply;

    const { overview, key_features, performance, pros, cons, final_rating } = data.review;

    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r bg-clip-text from-pink-500 to-purple-500">{data.product} Review</h2>
        <p className="mt-2 text-gray-300"><strong>Overview:</strong> {overview}</p>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-purple-400">Key Features:</h3>
          <ul className="list-disc list-inside text-gray-300">
            {key_features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2">
                <CheckCircle className="w-full h-full" />
              </div>
                <div>{feature}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-purple-400">Performance:</h3>
          <ul className="list-disc list-inside text-gray-300">
            {Object.entries(performance).map(([key, value]) => (
              <li key={key} className="flex items-center mb-1">
              <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2">
                <CheckCircle className="w-full h-full" />
              </div>
              <div><strong>{key}:</strong> {value}</div>
            </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-purple-400">Pros:</h3>
          <ul className="list-disc list-inside text-gray-300">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2">
                <CheckCircle className="w-full h-full" />
              </div>
                <div>{pro}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-purple-400">Cons:</h3>
          <ul className="list-disc list-inside text-gray-300">
            {cons.map((con, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2">
                <XCircle className="w-full h-full" />
              </div>
                <div>{con}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* <p className="mt-4 text-lg font-bold text-yellow-400">Final Rating: {final_rating}/5</p> */}
        {StarRating({ rating: final_rating })}
      </div>
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: { text: string; type: 'user' | 'bot' } = { text: input, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND2}/generate_review?product_name=${encodeURIComponent(input)}`);
      
      const data = await response.json();
      const formattedResponse = formatBotResponse(data);
      setMessages((prev) => [...prev, { text: formattedResponse || 'No response available.', type: 'bot' }]);
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
            className="w-full rounded-xl shadow-lg p-6 flex flex-col h-[80vh]"
          > 
            <div className="mb-4 text-center text-sm lg:text-lg text-gray-300">
            <p>Mention the product name, and let the bot do the rest!</p>
          </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-2 border border-gray-700 rounded-md">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-lg w-fit text-xs lg:text-lg  whitespace-pre-line ${msg.type === 'user' ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'}`}
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
              
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 text-xs lg:text-lg px-4 py-2 bg-gray-700 text-white rounded-lg outline-none"
                placeholder="Type a message..."
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={loading}
                className="ml-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}