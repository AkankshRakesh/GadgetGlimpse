'use client';
import React, { useState } from 'react';
import { Bot, Search, Star, AlertCircle, Loader2, ArrowLeft, Sparkles, ClipboardCheck } from 'lucide-react';
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

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.4
    }
  }
};

const shimmerAnimation = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};

const loadingPhrases = [
  {text: "Scanning Amazon reviews...", icon: <Sparkles className="w-6 h-6 text-white" />},
  {text: "Analyzing product ratings...", icon: <Search className="w-6 h-6 text-white" />},
  {text: "Gathering specifications...", icon: <Bot className="w-6 h-6 text-white" />},
  {text: "Processing review data...", icon:<Star className="w-6 h-6 text-white" /> },
  {text: "Almost there...", icon:<ClipboardCheck className="w-6 h-6 text-white" /> }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhrase(prev => (prev + 1) % loadingPhrases.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    setReviewData(null);
    setLoadingPhrase(0);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/api/reviews?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviewData(data);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch reviews. Please try a different search term.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-black">
      <div className="container mx-auto px-4 lg:px-8 py-8">
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

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          <motion.div className="bg-gray-800 rounded-2xl shadow-lg p-8">
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-extrabold mb-8 text-center lg:text-left text-white"
            >
              Search Gadgets
            </motion.h1>
            
            <motion.form 
              variants={fadeInUp}
              onSubmit={handleSubmit}
              className="mb-8"
            >
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-6 py-4 pr-14 text-white rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none shadow-sm text-lg transition-all"
                  aria-label="Product search input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-700 to-purple-700 text-white p-3 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                  aria-label="Search button"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Search className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
            </motion.form>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 p-4 bg-red-50 rounded-xl flex items-center text-red-700 text-base border border-red-100"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="bg-gray-800 rounded-xl p-8 relative overflow-hidden">
                  <motion.div
                    variants={shimmerAnimation}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-200 animate-ping" />
                      <div className="relative bg-gradient-to-r from-pink-700 to-purple-700 rounded-full p-4">
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
                  <div className="mt-6 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "linear" }}
                      className="h-full bg-purple-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {!reviewData && !loading && !error && (
              <motion.div 
                variants={fadeInUp}
                className="bg-gray-700 rounded-xl p-8 text-center"
              >
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-300">
                  Enter a product name above to see reviews from Amazon and Flipkart
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {reviewData?.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mt-8"
                >
                  <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4 text-white">{result.title}</h2>
                    <div className="flex flex-wrap gap-4 items-center text-gray-400 mb-4">
                      <div className="flex items-center bg-gray-700 px-4 py-2 rounded-full shadow-sm">
                        <span className="font-medium mr-2">Amazon</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="ml-1 font-semibold">{result.rating}</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 px-4 py-2 rounded-full shadow-sm text-purple-500 font-medium">
                        Price: {result.price}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 text-lg">{result.description}</p>
                    <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <h3 className="text-xl font-semibold mb-4 text-white">Specifications:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.specifications).map(([key, value]) => (
                          <div key={key} className="flex items-start space-x-2">
                            <span className="text-gray-500 font-medium min-w-[120px]">{key}:</span>
                            <span className="text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {result.reviews.map((review, reviewIndex) => (
                      <motion.div
                        key={reviewIndex}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: reviewIndex * 0.05 }}
                        className="bg-gray-700 rounded-xl p-6 shadow-sm border border-gray-600 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center mb-4">
                          <div className="flex items-center bg-gray-600 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1.5 text-yellow-600 font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-300">{review.review}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}