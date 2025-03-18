'use client'
import React, { useState } from 'react';
import { Bot, Search, Star, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Review {
  review: string;
  rating: string;
}

interface ReviewResult {
  title: string;
  price: string;
  rating: string;
  description: string;
  specifications: { [key: string]: string };
  reviews: Review[];
}

interface ReviewData {
  query: string;
  results: ReviewResult[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const backgroundVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20
    }
  }
};

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    setReviewData(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/reviews?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviewData(data);
    } catch (err) {
      setError('Failed to fetch reviews. Please try a different search term.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white"
    >
      {/* Background Decorations */}
      <motion.div 
        variants={backgroundVariants}
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-0 left-1/2 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <motion.nav 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Link href="/" className="flex items-center space-x-3">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
              <span className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                GadgetReviewBot
              </span>
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-auto hidden sm:block"
          >
            <Link
              href="/"
              className="group bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center sm:inline-flex"
            >
              <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back Home
            </Link>
          </motion.div>
        </motion.nav>

        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Search Gadgets
            </motion.h1>
            
            <motion.form 
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="mb-6 sm:mb-8"
            >
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 text-base sm:text-lg rounded-xl sm:rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="absolute cursor-pointer right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.button>
              </div>
            </motion.form>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-50 rounded-xl flex items-center text-red-700 text-sm sm:text-base border border-red-100"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {!reviewData && !loading && !error && (
              <motion.div
                className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center"
              >
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-base sm:text-lg">
                  Enter a product name above to see reviews from Amazon and Flipkart
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {reviewData?.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="mt-6 sm:mt-8"
                >
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">{result.title}</h2>
                    <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-gray-600 mb-4">
                      <div className="flex items-center bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
                        <span className="font-medium mr-2 text-sm sm:text-base">Amazon</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          <span className="ml-1 font-semibold text-sm sm:text-base">{result.rating}</span>
                        </div>
                      </div>
                      <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-blue-600 font-medium text-sm sm:text-base">
                        Price: {result.price}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base lg:text-lg">{result.description}</p>
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
                      <h3 className="font-semibold text-base sm:text-lg mb-4">Specifications:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(result.specifications).map(([key, value]) => (
                          <div key={key} className="flex items-start space-x-2">
                            <span className="text-gray-500 font-medium min-w-[100px] sm:min-w-[120px] text-sm sm:text-base">{key}:</span>
                            <span className="text-gray-700 text-sm sm:text-base">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    {result.reviews.map((review, reviewIndex) => (
                      <motion.div
                        key={reviewIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reviewIndex * 0.05 }}
                        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1.5 font-medium text-sm sm:text-base">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">{review.review}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}