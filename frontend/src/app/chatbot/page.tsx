"use client"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Bot, Loader2, ArrowLeft, Send, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ReviewCard } from "./review-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function App() {
  const [messages, setMessages] = useState<{ text: string | React.JSX.Element; type: "user" | "bot" }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Show welcome message on first load
    if (messages.length === 0) {
      setMessages([
        {
          type: "bot",
          text: "👋 Welcome to GadgetGlimpse! I can provide detailed reviews for any tech product. Just type a product name like 'iPhone 15 Pro' or 'Sony WH-1000XM5' and I'll generate a comprehensive review for you.",
        },
      ])
    }
  }, [])


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
  const handleGetSavedReview = () => {
    const saved = localStorage.getItem("savedReviews");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    const formatted = formatBotResponse(parsed);
    setMessages((prev) => [...prev, { type: "bot", text: formatted || "No saved review found." }]);
  };
  
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.",
          type: "bot",
        },
      ])
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    setIsListening(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      if (event.error === "no-speech") {
        setMessages((prev) => [
          ...prev,
          {
            text: "I couldn't hear anything. Please try speaking again or type your query.",
            type: "bot",
          },
        ])
      } else {
        console.error("Speech recognition error:", event.error)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const formatBotResponse = (data: BotResponse | BotResponse[]) => {
    if (Array.isArray(data)) {
      const first = data[0];
      if (!first.review) return first.reply;
      return <ReviewCard product={first.product || ""} review={first.review} />;
    } else {
      if (!data.review) return data.reply;
      return <ReviewCard product={data.product || ""} review={data.review} />;
    }
  };
  

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
      setMessages((prev) => [
        ...prev,
        { text: "Error fetching response. Please check your connection and try again.", type: "bot" },
      ])
    } finally {
      setLoading(false)
      // Focus the input after sending
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        type: "bot",
        text: "Chat cleared! What product would you like me to review next?",
      },
    ])
  }

  return (
    <TooltipProvider>
      <main className="h-screen overflow-y-hidden bg-gradient-to-b from-purple-950 to-black w-full">
        <div className="w-full h-full px-4 py-8">
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
          <div className="flex items-center gap-2">
          <Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="outline"
      onClick={handleGetSavedReview}
      className="hidden bg-gray-400 cursor-pointer md:flex items-center gap-1 px-6 py-2.5 rounded-full text-gray-900 hover:text-gray-600 border-gray-700 hover:border-gray-500"
    >
      Get Saved Review
    </Button>
  </TooltipTrigger>
  <TooltipContent>Retrieve the last saved review</TooltipContent>
</Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="default"
                    onClick={clearChat}
                    className="hidden cursor-pointer md:flex items-center gap-1 px-6 py-2.5 rounded-full text-gray-300 hover:text-white border-gray-700 hover:border-gray-500"
                  >
                    Clear Chat
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start a new conversation</TooltipContent>
              </Tooltip>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hidden lg:block"
          >
            <Link
              href="/choice"
              className="group bg-gradient-to-r from-purple-700 to-pink-700 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg inline-flex items-center"
            >
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Link>
          </motion.div>
          </div>
        </motion.nav>

          <div className="w-full text-white flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-7xl mx-auto rounded-xl shadow-2xl bg-gray-900/50 backdrop-blur-sm p-4 md:p-6 flex flex-col h-[75vh] border border-gray-700/50"
            >
              <div className="mb-4 text-center">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1">
                  Product Review Assistant
                </h1>
                <p className="text-gray-300 text-sm md:text-base">
                  Ask about any tech product to get a detailed review
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
                      className={` rounded-lg max-w-[85%] text-sm md:text-base whitespace-pre-line shadow-md ${
                        msg.type === "user"
                          ? "p-3 bg-gradient-to-r from-blue-600 to-blue-700 ml-auto"
                          : (msg.text == "👋 Welcome to GadgetGlimpse! I can provide detailed reviews for any tech product. Just type a product name like 'iPhone 15 Pro' or 'Sony WH-1000XM5' and I'll generate a comprehensive review for you." || msg.text == "Chat cleared! What product would you like me to review next?") ? "p-3 bg-gradient-to-r from-gray-700 to-gray-800" : "bg-gradient-to-r from-gray-700 to-gray-800"
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
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-2 bg-transparent text-white border-0 focus-visible:ring-1 focus-visible:ring-purple-500 text-sm md:text-base placeholder-gray-400"
                  placeholder="Type a product name (e.g., MacBook Pro M3)..."
                  aria-label="Product name input"
                  disabled={loading}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={startListening}
                      disabled={loading || isListening}
                      variant="outline"
                      size="icon"
                      className="ml-2 cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 hover:opacity-90 disabled:opacity-50"
                      aria-label="Use voice input"
                    >
                      <Mic className={`w-5 h-5 ${isListening ? "animate-pulse text-red-400" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isListening ? "Listening..." : "Speak product name"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      variant="outline"
                      size="icon"
                      className="ml-2 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 hover:opacity-90 disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send</TooltipContent>
                </Tooltip>
              </div>

              <div className="mt-2 text-center text-xs text-gray-400">Press Enter to send • ESC to clear input</div>
              
        <Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="outline"
      onClick={handleGetSavedReview}
      className="cursor-pointer md:hidden items-center gap-1 px-6 py-2.5 rounded-full text-gray-900 hover:text-gray-600 border-gray-700 hover:border-gray-500"
    >
      Get Saved Review
    </Button>
  </TooltipTrigger>
  <TooltipContent>Retrieve the last saved review</TooltipContent>
</Tooltip>
            </motion.div>
            
          </div>
          
        </div>
      </main>
    </TooltipProvider>
  )
}