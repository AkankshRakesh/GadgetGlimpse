"use client"
import React, { useState } from "react"
import {
  Bot,
  Search,
  Star,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  ClipboardCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeResultIndex, setActiveResultIndex] = useState(0)

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

  const openImageModal = (imageUrl: string, index: number, resultIndex: number) => {
    setSelectedImage(imageUrl)
    setCurrentImageIndex(index)
    setActiveResultIndex(resultIndex)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction: "next" | "prev") => {
    if (!reviewData?.results[activeResultIndex]?.images) return

    const images = reviewData.results[activeResultIndex].images
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % images.length
        : (currentImageIndex - 1 + images.length) % images.length

    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
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
                      placeholder="Search for smartphones, laptops, headphones..."
                      className="w-full px-6 py-4 pr-14 text-white bg-gray-800 bg-opacity-80 rounded-xl border border-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 outline-none shadow-lg text-lg transition-all placeholder-gray-400"
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
                    className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-3 ml-2 text-white">{result.title}</h2>
                      <a
                        href={result.amazonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-900/30 ml-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-shopping-cart"
                        >
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                        View on Amazon
                      </a>
                    </div>

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
                    <h3 className="text-xl font-semibold mb-4 ml-2 text-white flex items-center">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded mr-3"></span>
                      Specifications
                    </h3>
                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/50 shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.specifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-start space-x-2 group p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                          >
                            <span className="text-purple-300 font-medium min-w-[120px] group-hover:text-pink-300 transition-colors">
                              {key}:
                            </span>
                            <span className="text-gray-200 group-hover:text-white transition-colors">{value}</span>
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
                          className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border-l-4 border border-purple-500/50 hover:border-l-pink-500 hover:bg-gray-800/60 transition-all duration-300 group"
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

                    {/* Enhanced Image Gallery Section */}
                    {result.images && result.images.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4 ml-2 text-white flex items-center">
                          <span className="bg-gradient-to-r from-pink-500 to-purple-500 w-1 h-6 rounded mr-3"></span>
                          Product Images
                        </h3>

                        {/* Featured Image */}
                        <div className="mb- ">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                            onClick={() => openImageModal(result.images[0], 0, index)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                            <img
                              src={result.images[0] || "/placeholder.svg"}
                              alt={`${result.title} - featured`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white">
                              {result.images.length} images available
                            </div>
                          </motion.div>
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                          {result.images.map((image, imageIndex) => (
                            <motion.div
                              key={imageIndex}
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: imageIndex * 0.05 }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              whileTap={{ scale: 0.95 }}
                              className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow-md border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
                              onClick={() => openImageModal(image, imageIndex, index)}
                            >
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`${result.title} - ${imageIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                onClick={closeImageModal}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative flex-1 overflow-hidden rounded-xl">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Product image"
                  className="w-full h-full object-contain max-h-[90vh] max-w-full"
                />

                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition-colors"
                  onClick={() => navigateImage("prev")}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/70 transition-colors"
                  onClick={() => navigateImage("next")}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {reviewData?.results[activeResultIndex]?.images && (
                <div className="mt-4 overflow-x-auto pb-2">
                  <div className="flex space-x-2">
                    {reviewData.results[activeResultIndex].images.map((image, idx) => (
                      <div
                        key={idx}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer transition-all duration-300 ${
                          idx === currentImageIndex
                            ? "ring-2 ring-purple-500 scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => {
                          setCurrentImageIndex(idx)
                          setSelectedImage(image)
                        }}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 text-center text-white/80 text-sm">
                {currentImageIndex + 1} / {reviewData?.results[activeResultIndex]?.images?.length || 0}
              </div>
              {reviewData?.results[activeResultIndex]?.amazonLink && (
                <div className="mt-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-center">
                  <a
                    href={reviewData.results[activeResultIndex].amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-external-link"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Shop on Amazon
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

