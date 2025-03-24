"use client"
import React, { useState } from "react"
import { Bot, Search, Star, AlertCircle, Loader2, ArrowLeft, Sparkles, ClipboardCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"


interface Review {
  review: string
  rating: string
}

interface ReviewResult {
  title: string
  price: string
  rating: string
  description: string
  specifications: { [key: string]: string }
  reviews: Review[]
  images: string[]
  amazonLink: string
}

interface ReviewData {
  query: string
  results: ReviewResult[]
}

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.4,
    },
  },
}

const shimmerAnimation = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1.5,
      ease: "linear",
    },
  },
}

const loadingPhrases = [
  { text: "Scanning Amazon reviews...", icon: <Sparkles className="w-6 h-6 text-white" /> },
  { text: "Analyzing product ratings...", icon: <Search className="w-6 h-6 text-white" /> },
  { text: "Gathering specifications...", icon: <Bot className="w-6 h-6 text-white" /> },
  { text: "Processing review data...", icon: <Star className="w-6 h-6 text-white" /> },
  { text: "Almost there...", icon: <ClipboardCheck className="w-6 h-6 text-white" /> },
]

export default function App() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [loadingPhrase, setLoadingPhrase] = useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhrase((prev) => (prev + 1) % loadingPhrases.length)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return

    setLoading(true)
    setError("")
    setReviewData(null)
    setLoadingPhrase(0)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/reviews?query=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      const data = await response.json()
      setReviewData(data)
    } catch (err) {
      console.log(err)
      setError("Failed to fetch reviews. Please try a different search term.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black text-white">
      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
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
        
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeInUp}
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-95"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat opacity-5"></div>
            <div className="relative p-8 md:p-10">
              <motion.h1
                variants={fadeInUp}
                className="text-3xl lg:text-4xl font-extrabold mb-8 text-center lg:text-left bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200"
              >
                Search Gadgets
              </motion.h1>

              <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-md opacity-30"></div>
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter product name..."
                      className="w-full px-6 py-4 pr-14 text-white bg-gray-800 bg-opacity-80 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none shadow-sm text-lg transition-all placeholder-gray-400"
                      aria-label="Product search input"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      type="submit"
                      disabled={loading}
                      className="absolute right-3 cursor-pointer top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white p-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
                      aria-label="Search button"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    </motion.button>
                  </div>
                </div>
              </motion.form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 p-4 bg-red-900/30 backdrop-blur-sm rounded-xl flex items-center text-red-200 text-base border border-red-800/50 shadow-lg"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
                  {error}
                </motion.div>
              )}

              {loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 relative overflow-hidden border border-gray-700/50 shadow-lg">
                    <motion.div
                      variants={shimmerAnimation}
                      initial="initial"
                      animate="animate"
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
                        <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 rounded-full p-4 shadow-lg shadow-purple-600/30">
                          {loadingPhrases[loadingPhrase].icon}
                        </div>
                      </div>
                    </div>
                    <motion.p
                      key={loadingPhrase}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-lg text-center font-medium"
                    >
                      {loadingPhrases[loadingPhrase].text}
                    </motion.p>
                    <div className="mt-6 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {!reviewData && !loading && !error && (
                <motion.div
                  variants={fadeInUp}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700/50 shadow-lg"
                >
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-pulse"></div>
                    <div className="relative flex items-center justify-center h-full">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xl text-gray-300">
                    Enter a product name above to see reviews from Amazon and Flipkart
                  </p>
                  <p className="text-gray-400 mt-2 text-sm">
                    Try searching for &quot;smartphone&quot;, &quot;laptop&quot;, or &quot;headphones&quot;
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {reviewData?.results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="mt-8"
                  >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                      {/* <Link href={result.link}><h2 className="text-2xl font-semibold mb-4 ml-2 text-white">{result.title}</h2></Link> */}
                      <a href={result.amazonLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        <h2 className="text-2xl font-semibold mb-4 ml-2 text-white">{result.title}</h2>
                      </a>

                      <div className="flex flex-wrap gap-4 items-center text-gray-300 mb-6">
                        <div className="flex items-center bg-gray-700/70 px-4 py-2 rounded-full shadow-sm border border-gray-600/50">
                          <span className="font-medium mr-2">Amazon</span>
                          <div className="flex items-center text-yellow-400">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="ml-1 font-semibold">{result.rating}</span>
                          </div>
                        </div>
                        <div className="bg-gray-700/70 px-4 py-2 rounded-full shadow-sm border border-gray-600/50">
                          <span className="text-gray-300 mr-1">Price:</span>
                          <span className="text-purple-300 font-medium">{result.price}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-6 text-lg leading-relaxed">{result.description}</p>
                      <h3 className="text-xl font-semibold mb-4 ml-2  text-white flex items-center">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded mr-3"></span>
                          Specifications
                        </h3>
                      <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50 shadow-inner">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(result.specifications).map(([key, value]) => (
                            <div key={key} className="flex items-start space-x-2 group">
                              <span className="text-gray-400 font-medium min-w-[120px] group-hover:text-purple-300 transition-colors">
                                {key}:
                              </span>
                              <span className="text-gray-300 group-hover:text-white transition-colors">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-xl font-semibold text-white flex items-center ml-2">
                        <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded mr-3"></span>
                        Customer Reviews
                      </h3>
                      {result.reviews.map((review, reviewIndex) => (
                        <motion.div
                          key={reviewIndex}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: reviewIndex * 0.05 }}
                          className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-300 group"
                        >
                          <div className="flex items-center mb-4">
                            <div className="flex items-center bg-gray-700/70 px-3 py-1 rounded-full border border-gray-600/50">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1.5 text-yellow-300 font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-300 group-hover:text-white transition-colors duration-300 leading-relaxed">
                            {review.review}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 mt-4 ml-2  text-white flex items-center">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded mr-3"></span>
                      Images
                    </h3>
                    {result.images ? (<div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.images.map((image, imageIndex) => (
                            <motion.img
                              key={imageIndex}
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.5, delay: imageIndex * 0.1 }}
                              src={image}
                              alt={result.title}
                              className="rounded-xl w-full h-full object-cover shadow-lg"
                            />
                          ))}
                        </div>
                      </div>) : (<> </>)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

