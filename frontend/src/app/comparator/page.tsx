"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Bot,
  Loader2,
  ArrowLeft,
  ChevronsRight,
  Scale,
  Mic,
  Info,
  BarChart3,
  DollarSign,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ComparisonData {
  overview: string
  price: string
  key_features: string[]
  performance: Record<string, string[]>
  pros: string[]
  cons: string[]
  ratings: {
    product1: string
    product2: string
  }
  final_recommendation_product1: string
  final_recommendation_product2: string
}

export default function ProductComparison() {
  const [product1, setProduct1] = useState("")
  const [product2, setProduct2] = useState("")
  const [comparison, setComparison] = useState<{
    product1: string
    product2: string
    comparison: ComparisonData
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions1, setSuggestions1] = useState<string[]>([])
  const [suggestions2, setSuggestions2] = useState<string[]>([])
  const [showSuggestions1, setShowSuggestions1] = useState(false)
  const [showSuggestions2, setShowSuggestions2] = useState(false)
  const [recentComparisons, setRecentComparisons] = useState<Array<{ product1: string; product2: string }>>([
    { product1: "iPhone 15 Pro", product2: "Samsung Galaxy S23" },
    { product1: "MacBook Pro", product2: "Dell XPS 13" },
    { product1: "Sony WH-1000XM5", product2: "Bose QuietComfort" },
  ])
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Add this near the top of the component
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleProductInput = async (
    value: string,
    setProduct: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<string[]>>,
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setProduct(value)

    if (value.trim().length > 2) {
      try {
        // Mock suggestions - in a real app, you would fetch from an API
        const mockSuggestions = [`${value} Pro`, `${value} Max`, `${value} Ultra`, `${value} Plus`, `${value} Mini`]
        setSuggestions(mockSuggestions)
        setShowSuggestions(true)
      } catch (err) {
        console.error("Failed to fetch suggestions", err)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const fetchComparison = async () => {
    if (!product1.trim() || !product2.trim()) {
      setError("Please enter both product names")
      return
    }

    setLoading(true)
    setError("")
    setComparison(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND2}/api/compare_products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product1: product1,
          product2: product2,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setComparison({
          product1: product1,
          product2: product2,
          comparison: data.comparison,
        })
        // Save to recent comparisons if not already there
        setRecentComparisons((prev) => {
          const newComparison = { product1, product2 }
          const exists = prev.some(
            (item) =>
              (item.product1 === product1 && item.product2 === product2) ||
              (item.product1 === product2 && item.product2 === product1),
          )
          if (!exists) {
            return [newComparison, ...prev].slice(0, 5) // Keep only the 5 most recent
          }
          return prev
        })
        setActiveTab("overview")
      } else {
        throw new Error(data.error || "Failed to generate comparison")
      }
    } catch (err) {
      setError("Failed to generate comparison. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startListening = (setProduct: React.Dispatch<React.SetStateAction<string>>) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in your browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setProduct(transcript)
    }

    recognition.start()
  }

  const renderStars = (rating: string) => {
    const ratingNum = Number.parseInt(rating)
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < ratingNum ? "text-yellow-400" : "text-gray-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="font-medium">{rating}/5</span>
      </div>
    )
  }

  const shareComparison = async () => {
    if (!comparison) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${comparison.product1} vs ${comparison.product2} Comparison`,
          text: `Check out this comparison between ${comparison.product1} and ${comparison.product2}!`,
          url: window.location.href,
        })
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-6xl">
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8"
          >
            <Link href="/" className="flex items-center gap-2 group mb-4 md:mb-0">
              <Bot className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                GadgetGlimpse <span className="text-white/70">Compare</span>
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-600 hover:bg-gray-800 text-sm md:text-base px-2 md:px-4"
                onClick={() => {
                  setProduct1("")
                  setProduct2("")
                  setComparison(null)
                }}
              >
                Reset
              </Button>
              <Link href="/choice">
                <Button className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-sm md:text-base px-2 md:px-4">
                  <ArrowLeft className="mr-1 md:mr-2 w-3 h-3 md:w-4 md:h-4" />
                  Back
                </Button>
              </Link>
            </div>
          </motion.header>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 p-4 md:p-6 rounded-xl border border-gray-700 mb-6 md:mb-8 backdrop-blur-sm"
          >
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <Scale className="text-purple-400 w-4 h-4 md:w-5 md:h-5" />
              Compare Two Products
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
              <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-gray-300">Product 1</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={product1}
                      onChange={(e) =>
                        handleProductInput(e.target.value, setProduct1, setSuggestions1, setShowSuggestions1)
                      }
                      onFocus={() => product1.trim().length > 2 && setShowSuggestions1(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions1(false), 200)}
                      placeholder="e.g., iPhone 15 Pro"
                      className="bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {showSuggestions1 && suggestions1.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-40 md:max-h-60 overflow-auto">
                        {suggestions1.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-700 cursor-pointer text-xs md:text-sm"
                            onClick={() => {
                              setProduct1(suggestion)
                              setShowSuggestions1(false)
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startListening(setProduct1)}
                        className=" cursor-pointer border-gray-600 hover:border-purple-500 hover:bg-gray-700"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="block text-sm font-medium text-gray-300">Product 2</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={product2}
                      onChange={(e) =>
                        handleProductInput(e.target.value, setProduct2, setSuggestions2, setShowSuggestions2)
                      }
                      onFocus={() => product2.trim().length > 2 && setShowSuggestions2(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions2(false), 200)}
                      placeholder="e.g., Samsung Galaxy S23"
                      className="bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                    />
                    {showSuggestions2 && suggestions2.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-40 md:max-h-60 overflow-auto">
                        {suggestions2.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-700 cursor-pointer text-xs md:text-sm"
                            onClick={() => {
                              setProduct2(suggestion)
                              setShowSuggestions2(false)
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startListening(setProduct2)}
                        className="cursor-pointer border-gray-600 hover:border-purple-500 hover:bg-gray-700"
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice input</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4 text-red-200 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={fetchComparison}
              disabled={loading || !product1.trim() || !product2.trim()}
              className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-all duration-300 transform hover:scale-[1.01]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronsRight className="w-4 h-4 mr-2" />}
              Generate Comparison
            </Button>
          </motion.div>

          {!loading && !comparison && recentComparisons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/30 p-4 md:p-6 rounded-xl border border-gray-700 mb-6 md:mb-8"
            >
              <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4 text-gray-300">Recent Comparisons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                {recentComparisons.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start border-gray-700 hover:border-purple-500 hover:bg-gray-700/50 h-auto py-2 md:py-3 text-xs md:text-sm"
                    onClick={() => {
                      setProduct1(item.product1)
                      setProduct2(item.product2)
                    }}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-purple-400 truncate max-w-[120px] sm:max-w-[150px] md:max-w-full">
                        {item.product1}
                      </span>
                      <span className="text-xs text-gray-400">vs</span>
                      <span className="text-blue-400 truncate max-w-[120px] sm:max-w-[150px] md:max-w-full">
                        {item.product2}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="h-2 bg-gray-700 animate-pulse"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-700 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-10 bg-gray-800/70 rounded-lg animate-pulse"></div>
              <div className="h-64 bg-gray-800/50 border border-gray-700 rounded-xl animate-pulse"></div>
            </motion.div>
          )}

          {/* Results Section */}
          <AnimatePresence>
            {comparison && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700"></div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{comparison.product1}</span>
                        <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700">
                          Recommendation: {comparison.comparison.final_recommendation_product1}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderStars(comparison.comparison.ratings.product1)}</CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{comparison.product2}</span>
                        <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
                        Recommendation: {comparison.comparison.final_recommendation_product2}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{renderStars(comparison.comparison.ratings.product2)}</CardContent>
                  </Card>
                </div>

                {/* Share Button */}
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    onClick={shareComparison}
                    className="cursor-pointer border-gray-700 hover:border-purple-500 hover:bg-gray-800 text-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Share Comparison
                  </Button>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-5 h-full w-full bg-gray-800/70 p-1 overflow-x-auto">
                    <TabsTrigger
                      value="overview"
                      className="cursor-pointer data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                    >
                      <Info className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="price"
                      className="cursor-pointer data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                    >
                      <DollarSign className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">Price</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="features"
                      className="cursor-pointer data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                    >
                      <ListChecks className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">Features</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="performance"
                      className="cursor-pointer data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                    >
                      <BarChart3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">Performance</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pros-cons"
                      className="cursor-pointer data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-200 px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm"
                    >
                      <div className="flex items-center">
                        <ThumbsUp className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="mx-0.5 md:mx-1">/</span>
                        <ThumbsDown className="w-2 h-2 md:w-3 md:h-3" />
                      </div>
                      <span className="hidden md:inline ml-2">Pros & Cons</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="text-purple-400" />
                          Comparison Overview
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          A high-level comparison between {comparison.product1} and {comparison.product2}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                            {comparison.comparison.overview}
                          </p>
                        </div>

                        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="bg-gray-700/30 rounded-lg p-3 md:p-4 border border-gray-700">
                            <h4 className="text-sm md:text-base font-medium mb-2 md:mb-3 text-purple-300">
                              {comparison.product1}
                            </h4>
                            <div className="space-y-3 md:space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-400">Rating</span>
                                  <span className="text-xs font-medium text-purple-300">
                                    {comparison.comparison.ratings.product1}/5
                                  </span>
                                </div>
                                <Progress
                                  value={Number.parseInt(comparison.comparison.ratings.product1) * 20}
                                  className="h-1.5 md:h-2 bg-gray-700"
                                >
                                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full" />
                                </Progress>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-700/30 rounded-lg p-3 md:p-4 border border-gray-700">
                            <h4 className="text-sm md:text-base font-medium mb-2 md:mb-3 text-blue-300">
                              {comparison.product2}
                            </h4>
                            <div className="space-y-3 md:space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-400">Rating</span>
                                  <span className="text-xs font-medium text-blue-300">
                                    {comparison.comparison.ratings.product2}/5
                                  </span>
                                </div>
                                <Progress
                                  value={Number.parseInt(comparison.comparison.ratings.product2) * 20}
                                  className="h-1.5 md:h-2 bg-gray-700"
                                >
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
                                </Progress>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Price Tab */}
                  <TabsContent value="price" className="mt-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="text-purple-400" />
                          Price Comparison
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Cost analysis between {comparison.product1} and {comparison.product2}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-700/30 p-5 rounded-lg border border-gray-700">
                          <p className="text-gray-300 leading-relaxed">{comparison.comparison.price}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="mt-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ListChecks className="text-purple-400" />
                          Key Features Comparison
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Important features of {comparison.product1} vs {comparison.product2}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {comparison.comparison.key_features.map((feature, i) => (
                            <div
                              key={i}
                              className="bg-gray-700/30 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                            >
                              <p className="text-gray-300">{feature}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Performance Tab */}
                  <TabsContent value="performance" className="mt-6">
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="text-purple-400" />
                          Performance Comparison
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          How {comparison.product1} and {comparison.product2} perform in different areas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {Object.entries(comparison.comparison.performance).map(([metric, details], index) => (
                            <AccordionItem
                              key={index}
                              value={`item-${index}`}
                              className="border-b border-gray-700 last:border-0"
                            >
                              <AccordionTrigger className="hover:text-purple-300 py-4">
                                <span className="font-medium">{metric}</span>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 md:pt-2 pb-3 md:pb-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                                  <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-3 md:p-4">
                                    <h5 className="text-xs md:text-sm font-medium text-purple-300 mb-1 md:mb-2">
                                      {comparison.product1}
                                    </h5>
                                    <p className="text-xs md:text-sm text-gray-300">{details[0]}</p>
                                  </div>
                                  <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 md:p-4">
                                    <h5 className="text-xs md:text-sm font-medium text-blue-300 mb-1 md:mb-2">
                                      {comparison.product2}
                                    </h5>
                                    <p className="text-xs md:text-sm text-gray-300">{details[1]}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Pros & Cons Tab */}
                  <TabsContent value="pros-cons" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pros */}
                      <Card className="bg-gray-800/50 border-green-700/30 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-green-500 to-green-700"></div>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ThumbsUp className="text-green-400 w-5 h-5" />
                            Advantages
                          </CardTitle>
                          <CardDescription className="text-gray-400">Strengths of these products</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 md:space-y-3">
                            {comparison.comparison.pros.map((pro, i) => (
                              <li
                                key={i}
                                className="flex items-start bg-green-900/20 p-2 md:p-3 rounded-lg border border-green-800/30"
                              >
                                <span className="text-green-400 mr-2 mt-0.5 text-xs md:text-base">✓</span>
                                <span className="text-gray-300 text-xs md:text-sm">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Cons */}
                      <Card className="bg-gray-800/50 border-red-700/30 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ThumbsDown className="text-red-400 w-5 h-5" />
                            Limitations
                          </CardTitle>
                          <CardDescription className="text-gray-400">Weaknesses to consider</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 md:space-y-3">
                            {comparison.comparison.cons.map((con, i) => (
                              <li
                                key={i}
                                className="flex items-start bg-red-900/20 p-2 md:p-3 rounded-lg border border-red-800/30"
                              >
                                <span className="text-red-400 mr-2 mt-0.5 text-xs md:text-base">✗</span>
                                <span className="text-gray-300 text-xs md:text-sm">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-4 md:bottom-6 right-4 md:right-6 p-2 md:p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 md:w-5 md:h-5"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </TooltipProvider>
  )
}
