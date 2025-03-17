'use client';

import { useState } from 'react';
import { Bot, Search, Star, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
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
      staggerChildren: 0.2
    }
  }
};

export default function BotPage() {
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
      const response = await fetch(`http://localhost:5000/api/reviews?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviewData(data);
    } catch (err) {
      setError('Failed to fetch reviews. Please try a different search term.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute top-0 left-1/2 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl" />
        </motion.div>

        <div className="container mx-auto  lg:px-8 py-8">
          <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center lg:justify-between items-center mb-8 lg:mb-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" 
              className="flex items-center space-x-3">
              <Bot className="w-16 h-16 lg:w-8 lg:h-8 text-blue-600" />
              <span className="text-2xl lg:text-xl mt-2 lg:mt-1 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                GadgetReviewBot
              </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className='hidden lg:block'>
              <Link 
                href="/"
                className="group bg-white text-blue-600 px-6 py-2.5 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back Home
              </Link>
            </motion.div>
          </motion.nav>

          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-xl text-center lg:text-left lg:text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
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
                    placeholder="Enter product name to search reviews..."
                    className="w-full px-6 py-4 pr-14 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm text-md lg:text-lg transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 lg:p-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </motion.form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-4 bg-red-50 rounded-xl flex items-center text-red-700 border border-red-100"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {!reviewData && !loading && !error && (
                <motion.div 
                  variants={fadeInUp}
                  className="bg-gray-50 rounded-xl p-8 text-center"
                >
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    Enter a product name above to see reviews from Amazon and Flipkart
                  </p>
                </motion.div>
              )}

              {reviewData?.results.map((result, resultIndex) => (
                <motion.div
                  key={resultIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: resultIndex * 0.1 }}
                  className="mt-8"
                >
                  <div className="bg-gray-50 rounded-xl p-8 mb-6 border border-gray-100">
                    <h2 className="text-2xl font-semibold mb-4">{result.title}</h2>
                    <div className="flex flex-wrap gap-4 items-center text-gray-600 mb-4">
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="font-medium mr-2">Amazon</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="ml-1 font-semibold">{result.rating}</span>
                        </div>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm text-blue-600 font-medium">
                        Price: {result.price}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">{result.description}</p>
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <h3 className="font-semibold text-lg mb-4">Specifications:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(result.specifications).map(([key, value]) => (
                          <div key={key} className="flex items-start space-x-2">
                            <span className="text-gray-500 font-medium min-w-[120px]">{key}:</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {result.reviews.map((review, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.review}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}