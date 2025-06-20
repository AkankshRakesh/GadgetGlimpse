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
  Webhook,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ComparisonData {
  overview: string
  priceShort: {
    product1: string
    product2: string
  }
  bestFor: {
    product1: string
    product2: string
  }
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
        setRecentComparisons((prev) => {
          const newComparison = { product1, product2 }
          const exists = prev.some(
            (item) =>
              (item.product1 === product1 && item.product2 === product2) ||
              (item.product1 === product2 && item.product2 === product1),
          )
          if (!exists) {
            return [newComparison, ...prev].slice(0, 5);
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

  const copyComparison = async () => {
    if (!comparison) return
  
    try {
      let comparisonText = `Comparison between ${comparison.product1} and ${comparison.product2}\n\n`
      
      comparisonText += `Ratings:\n`
      comparisonText += `${comparison.product1}: ${comparison.comparison.ratings.product1}/5\n`
      comparisonText += `${comparison.product2}: ${comparison.comparison.ratings.product2}/5\n\n`
      
      comparisonText += `Recommendations:\n`
      comparisonText += `${comparison.product1}: ${comparison.comparison.final_recommendation_product1}\n`
      comparisonText += `${comparison.product2}: ${comparison.comparison.final_recommendation_product2}\n\n`
      
      comparisonText += `Overview:\n${comparison.comparison.overview}\n\n`
      
      comparisonText += `Price Comparison:\n${comparison.comparison.price}\n\n`
      
      comparisonText += `Key Features:\n`
      comparison.comparison.key_features.forEach(feature => {
        comparisonText += `- ${feature}\n`
      })
      comparisonText += `\n`
      
      comparisonText += `Performance Comparison:\n`
      Object.entries(comparison.comparison.performance).forEach(([metric, details]) => {
        comparisonText += `${metric}:\n`
        comparisonText += `${comparison.product1}: ${details[0]}\n`
        comparisonText += `${comparison.product2}: ${details[1]}\n\n`
      })
      
      comparisonText += `Pros:\n`
      comparison.comparison.pros.forEach(pro => {
        comparisonText += `- ${pro}\n`
      })
      comparisonText += `\n`
      
      comparisonText += `Cons:\n`
      comparison.comparison.cons.forEach(con => {
        comparisonText += `- ${con}\n`
      })
  
      await navigator.clipboard.writeText(comparisonText)
      
      const button = document.getElementById('copy-comparison-button')
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Copied!'
        setTimeout(() => {
          if (button) button.textContent = originalText
        }, 2000)
      }
    } catch (err) {
      console.error("Error copying comparison:", err)
      alert("Failed to copy comparison. Please try again.")
    }
  }
  return (
    <TooltipProvider>
      
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8 max-w-7xl">
          <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center lg:justify-between items-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center space-x-3"
          >
            <Link href="/" className="flex items-center space-x-3">
              <Webhook className="w-16 h-16 lg:w-8 lg:h-8 text-pink-500" />
              <span className="text-2xl lg:text-xl mt-2 lg:mt-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                GadgetGlimpse
              </span>
            </Link>
          </motion.div>
          <div className="hidden lg:flex items-center gap-2">
          <Button
                variant="outline"
                size="lg"
                className="cursor-pointer border-gray-600 rounded-full hover:bg-gray-800 text-base px-6 py-2.5"
                onClick={() => {
                  setProduct1("")
                  setProduct2("")
                  setComparison(null)
                }}
              >
                Reset
              </Button>
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
                    className="cursor-pointer justify-start border-gray-700 hover:border-purple-500 hover:bg-gray-700/50 h-auto py-2 md:py-3 text-xs md:text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Product 1 Card */}
  {/* Product 1 Card - Blue/Purple Theme */}
<Card className="bg-gray-800/50 border-gray-700 overflow-hidden shadow-lg">
  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
  <CardHeader>
    <CardTitle className="flex justify-between items-center">
      <span className="text-indigo-100">{comparison.product1}</span>
      <Badge variant="outline" className="bg-indigo-900/30 text-indigo-300 border-indigo-700">
        Recommendation: {comparison.comparison.final_recommendation_product1}
      </Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-3">
      <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-800/50 shadow-sm">
        <DollarSign className="text-indigo-400 w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-indigo-300/80">Price</p>
        <p className="text-xl font-bold text-indigo-100">
          {comparison.comparison.priceShort.product1}
        </p>
      </div>
    </div>
  </CardContent>
  <CardFooter className="pt-0">
    <div className="w-full bg-indigo-900/20 rounded-lg p-3 border border-indigo-800/30">
      <p className="text-sm text-indigo-200">
         {comparison.comparison.bestFor.product1}
      </p>
    </div>
  </CardFooter>
</Card>

{/* Product 2 Card - Amber Theme */}
<Card className="bg-gray-800/50 border-gray-700 overflow-hidden shadow-lg">
  <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>
  <CardHeader>
    <CardTitle className="flex justify-between items-center">
      <span className="text-amber-100">{comparison.product2}</span>
      <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-700">
        Recommendation: {comparison.comparison.final_recommendation_product2}
      </Badge>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-3">
      <div className="bg-amber-900/30 p-3 rounded-lg border border-amber-800/50 shadow-sm">
        <DollarSign className="text-amber-400 w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-amber-300/80">Price</p>
        <p className="text-xl font-bold text-amber-100">
          {comparison.comparison.priceShort.product2}
        </p>
      </div>
    </div>
  </CardContent>
  <CardFooter className="pt-0">
    <div className="w-full bg-amber-900/20 rounded-lg p-3 border border-amber-800/30">
      <p className="text-sm text-amber-200">
         {comparison.comparison.bestFor.product2}
      </p>
    </div>
  </CardFooter>
</Card>
</div>

                <div className="flex justify-end mb-4 gap-2">
  <Button
    variant="outline"
    onClick={copyComparison}
    id="copy-comparison-button"
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    Copy Comparison
  </Button>
</div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid gap-2 grid-cols-5 h-full w-full bg-gray-800/70 p-1 overflow-x-auto">
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
                  <Card className="bg-gray-800/50 border-gray-700 shadow-lg backdrop-blur-sm">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-white">
      <Info className="text-indigo-400" />
      Comparison Overview
    </CardTitle>
    <CardDescription className="text-gray-400">
      A high-level comparison between {comparison.product1} and {comparison.product2}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="prose prose-invert max-w-none">
      <p className="text-base text-gray-300 leading-relaxed">{comparison.comparison.overview}</p>
    </div>

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Product 1 Card - Blue/Purple Theme */}
      <div className="bg-gradient-to-br from-indigo-900/30 via-gray-800/50 to-purple-900/20 rounded-xl p-5 border border-indigo-700/40 shadow-lg hover:border-indigo-500/50 transition-all">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-500 rounded-full blur-xl opacity-30"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-600 rounded-full blur-xl opacity-30"></div>
        
        <h4 className="text-lg font-semibold mb-4 text-indigo-200 flex items-center gap-3">
          <span className="w-3 h-3 bg-indigo-400 rounded-full flex-shrink-0"></span>
          {comparison.product1}
        </h4>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-indigo-300/80">Rating</span>
              <span className="text-sm font-medium bg-indigo-900/40 px-2 py-1 rounded-md text-indigo-200">
                {comparison.comparison.ratings.product1}/5
              </span>
            </div>
            <Progress
              value={Number.parseInt(comparison.comparison.ratings.product1) * 20}
              className="h-2 bg-gray-700/80"
            >
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
            </Progress>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-indigo-300">Price:</span>{" "}
              <span className="font-medium">{comparison.comparison.priceShort.product1}</span>
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <span className="font-medium text-indigo-300">Recommendation:</span>{" "}
              {comparison.comparison.final_recommendation_product1}
            </p>
          </div>
        </div>
      </div>

      {/* Product 2 Card - Amber Theme */}
      <div className="bg-gradient-to-br from-amber-900/30 via-gray-800/50 to-orange-900/20 rounded-xl p-5 border border-amber-700/40 shadow-lg hover:border-amber-500/50 transition-all">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-500 rounded-full blur-xl opacity-30"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-orange-600 rounded-full blur-xl opacity-30"></div>
        
        <h4 className="text-lg font-semibold mb-4 text-amber-200 flex items-center gap-3">
          <span className="w-3 h-3 bg-amber-400 rounded-full flex-shrink-0"></span>
          {comparison.product2}
        </h4>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-amber-300/80">Rating</span>
              <span className="text-sm font-medium bg-amber-900/40 px-2 py-1 rounded-md text-amber-200">
                {comparison.comparison.ratings.product2}/5
              </span>
            </div>
            <Progress
              value={Number.parseInt(comparison.comparison.ratings.product2) * 20}
              className="h-2 bg-gray-700/80"
            >
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" />
            </Progress>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-amber-300">Price:</span>{" "}
              <span className="font-medium">{comparison.comparison.priceShort.product2}</span>
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <span className="font-medium text-amber-300">Recommendation:</span>{" "}
              {comparison.comparison.final_recommendation_product2}
            </p>
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
                              <AccordionTrigger className="cursor-pointer hover:text-purple-300 py-4">
                                <span className="font-medium">{metric}</span>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 md:pt-2 pb-3 md:pb-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
<div className="bg-indigo-900/20 border border-indigo-800/50 rounded-lg p-3 md:p-4 shadow-sm">
  <h5 className="text-xs md:text-sm font-medium text-indigo-300 mb-1 md:mb-2">
    {comparison.product1}
  </h5>
  <p className="text-xs md:text-sm text-indigo-100">{details[0]}</p>
</div>

<div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 md:p-4 shadow-sm">
  <h5 className="text-xs md:text-sm font-medium text-amber-300 mb-1 md:mb-2">
    {comparison.product2}
  </h5>
  <p className="text-xs md:text-sm text-amber-100">{details[1]}</p>
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
