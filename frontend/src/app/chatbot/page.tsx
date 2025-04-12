"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, ArrowLeft, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ReviewCard } from "./review-card"

export default function App() {
  const [messages, setMessages] = useState<{ text: string | React.JSX.Element; type: "user" | "bot" }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  interface BotResponse {
    review?: {
      overview: string
      key_features: string[]
      performance: Record<string, string>
      pros: string[]
      cons: string[]
      final_rating: number
    }
    product?: string
    reply?: string
  }
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); // Set the input with the speech text
      console.log(transcript)
    };
  
    recognition.onerror = (event: any) => {
      if(event.error === "no-speech") {
        alert("No speech detected. Please try again.");

      }
      
      console.error("Speech recognition error:", event.error);
    };
    recognition.onend = () => {
      console.log("Speech recognition ended.");
    };
  
    recognition.start();
  };
  
  const formatBotResponse = (data: BotResponse) => {
    if (!data.review) return data.reply
    return <ReviewCard product={data.product || ""} review={data.review} />
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: { text: string; type: "user" | "bot" } = { text: input, type: "user" }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND2}/generate_review?product_name=${encodeURIComponent(input)}`,
      )

      const data = await response.json()
      const formattedResponse = formatBotResponse(data)
      setMessages((prev) => [...prev, { text: formattedResponse || "No response available.", type: "bot" }])
    } catch (error) {
      console.log(error)
      setMessages((prev) => [...prev, { text: "Error fetching response. Try again.", type: "bot" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
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

        <div className="w-full text-white flex flex-col items-center justify-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-xl shadow-2xl bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 flex flex-col h-[75vh] border border-gray-700/50"
          >
            <div className="mb-4 text-center">
              <p className="text-gray-300 text-sm md:text-base font-medium">
                Mention the product name, and let the bot do the rest!
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-3 border border-gray-700/50 rounded-lg bg-gray-800/30 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-lg max-w-[85%] text-sm md:text-base whitespace-pre-line shadow-md ${
                      msg.type === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 ml-auto"
                        : "bg-gradient-to-r from-gray-700 to-gray-800"
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="self-start bg-gray-700 p-3 rounded-lg flex items-center space-x-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span className="text-gray-300 text-sm">Generating review...</span>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center mt-4 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-2 bg-transparent text-white rounded-lg outline-none text-sm md:text-base placeholder-gray-400"
                placeholder="Type a product name..."
              />
              <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={startListening}
    disabled={loading}
    className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:opacity-90 disabled:opacity-50 shadow-md"
    title="Speak"
  >
    🎤
  </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={loading}
                className="ml-2 p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:opacity-90 disabled:opacity-50 shadow-md"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

