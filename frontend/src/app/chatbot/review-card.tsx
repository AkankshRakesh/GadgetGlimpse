"use client"

import { CheckCircle, XCircle, Info, ChevronDown, ChevronUp, Share2, Bookmark, Check, Copy } from "lucide-react"
import { StarRating } from "./star-rating"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ReviewProps {
  product: string
  review: {
    overview: string
    price?: string
    key_features: string[]
    performance: Record<string, string>
    pros: string[]
    cons: string[]
    final_rating: number
  }
}

export function ReviewCard({ product, review }: ReviewProps) {
  const { overview, price, key_features, performance, pros, cons, final_rating } = review
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    features: true,
    performance: true,
    pros: true,
    cons: true,
  })
  const [isSaved, setIsSaved] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getPerformanceScore = (value: string): number => {
    return Math.min(Math.max(parseInt(value), 0), 100) // Ensure value is between 0 and 100
  }

  const handleSaveReview = () => {
    setIsSaved(!isSaved)
    
    localStorage.removeItem('savedReviews')
    localStorage.setItem('savedReviews', JSON.stringify([{product, review}]))
  }

  const handleCopyReview = () => {
    const reviewText = formatReviewForSharing()
    navigator.clipboard.writeText(reviewText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShare = async (method: 'clipboard' | 'twitter' | 'whatsapp') => {
    const reviewText = formatReviewForSharing()
    const shareUrl = window.location.href
    const shareTitle = `Review of ${product}`
    
    switch (method) {
      case 'clipboard':
        navigator.clipboard.writeText(`${shareTitle}\n\n${reviewText}\n\n${shareUrl}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`)
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n\n${reviewText}\n\n${shareUrl}`)}`)
        break
    }
  }

  const formatReviewForSharing = (): string => {
    return `
${product} Review (${final_rating}⭐)

📌 Overview:
${overview}

🔑 Key Features:
${key_features.map(f => `• ${f}`).join('\n')}

📊 Performance:
${Object.entries(performance).map(([k, v]) => `• ${k}: ${v[0]}% - ${v[1]}`).join('\n')}

✅ Pros:
${pros.map(p => `• ${p}`).join('\n')}

❌ Cons:
${cons.map(c => `• ${c}`).join('\n')}

Final Verdict: ${final_rating >= 4.5 ? "Highly Recommended" : final_rating >= 3.5 ? "Recommended" : final_rating >= 2.5 ? "Average" : "Not Recommended"}
    `.trim()
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl p-5 shadow-xl border border-purple-500/30 mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-700/50 pb-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r bg-clip-text from-pink-500 to-purple-500">
              {product}
            </h2>
            <div className="flex items-center mt-1 gap-2">
              <StarRating rating={final_rating} />
            </div>
          </div>

          {price && (
            <Badge
              variant="outline"
              className="bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 px-3 py-1.5 text-purple-300 text-sm font-medium"
            >
              {price}
            </Badge>
          )}
        </div>

        {/* Overview Section */}
        <motion.div
          className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-semibold text-purple-300 mb-2">Overview</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">{overview}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Features Section */}
        <motion.div
          className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("features")}>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 p-1.5 rounded">
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </span>
              <h3 className="text-base md:text-lg font-semibold text-purple-400">Key Features</h3>
            </div>
            {expandedSections.features ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ul className="list-none space-y-2 text-gray-300 mt-3 pl-2">
                  {key_features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2 mt-1">
                        <CheckCircle className="w-full h-full" />
                      </div>
                      <div className="text-sm md:text-base">{feature}</div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Performance Section */}
        <motion.div
          className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("performance")}
          >
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 p-1.5 rounded">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </span>
              <h3 className="text-base md:text-lg font-semibold text-blue-400">Performance in %</h3>
            </div>
            {expandedSections.performance ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.performance && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <ul className="list-none space-y-4 text-gray-300 mt-3">
                  {Object.entries(performance).map(([key, value], index) => (
                    <motion.li
                      key={key}
                      className="flex flex-col"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-blue-300 text-sm">{key}</strong>
                        <span className="text-xs text-gray-400">{(value[0])}</span>
                      </div>
                      <Progress value={getPerformanceScore(value[0])} className="h-2 bg-gray-700" />
                      <p className="text-sm mt-1 text-gray-400">{value[1]}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pros and Cons Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Pros Section */}
          <motion.div
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("pros")}>
              <div className="flex items-center gap-2">
                <span className="bg-green-500/20 p-1.5 rounded">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </span>
                <h3 className="text-base md:text-lg font-semibold text-green-400">Pros</h3>
              </div>
              {expandedSections.pros ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.pros && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="list-none space-y-2 text-gray-300 mt-3 pl-2">
                    {pros.map((pro, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2 mt-1">
                          <CheckCircle className="w-full h-full" />
                        </div>
                        <div className="text-sm md:text-base">{pro}</div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Cons Section */}
          <motion.div
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("cons")}>
              <div className="flex items-center gap-2">
                <span className="bg-red-500/20 p-1.5 rounded">
                  <XCircle className="w-4 h-4 text-red-400" />
                </span>
                <h3 className="text-base md:text-lg font-semibold text-red-400">Cons</h3>
              </div>
              {expandedSections.cons ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <AnimatePresence>
              {expandedSections.cons && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="list-none space-y-2 text-gray-300 mt-3 pl-2">
                    {cons.map((con, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-4 h-4 text-red-400 mr-2 mt-1">
                          <XCircle className="w-full h-full" />
                        </div>
                        <div className="text-sm md:text-base">{con}</div>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer Section */}
        <motion.div
          className="mt-5 pt-4 border-t border-gray-700/50 flex flex-wrap justify-between items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="bg-purple-600/10 border-purple-500/20 text-purple-400">
                {final_rating >= 4.5
                  ? "Highly Recommended"
                  : final_rating >= 3.5
                    ? "Recommended"
                    : final_rating >= 2.5
                      ? "Average"
                      : "Not Recommended"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer px-2 bg-transparent border-gray-700 hover:bg-gray-800"
                  onClick={handleSaveReview}
                >
                  {isSaved ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-purple-400" />
                  )}
                  <span className="sr-only">Save review</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isSaved ? "Review saved" : "Save this review"}</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 cursor-pointer px-2 bg-transparent border-gray-700 hover:bg-gray-800"
                    >
                      <Share2 className="h-4 w-4 text-purple-400" />
                      <span className="sr-only">Share review</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Share this review</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-400 hover:bg-gray-700"
                  onClick={() => handleShare('clipboard')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy to clipboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-400 hover:bg-gray-700"
                  onClick={() => handleShare('twitter')}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span>Share on Twitter</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-gray-400 hover:bg-gray-700"
                  onClick={() => handleShare('whatsapp')}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Share on WhatsApp</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}