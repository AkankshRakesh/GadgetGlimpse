'use client';

import { useState } from 'react';
import { Bot, Search, Star, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface Review {
  rating: string;
  title: string;
  text: string;
  date: string;
  verified: boolean;
}

interface ReviewResult {
  source: string;
  url: string;
  productName: string;
  overallRating: string;
  reviews: Review[];
}

interface ReviewData {
  query: string;
  results: ReviewResult[];
}

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
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Bot className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold">GadgetReviewBot</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">Search Product Reviews</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter product name to search reviews..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {!reviewData && !loading && !error && (
              <div className="mt-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-600 text-center">
                    Enter a product name above to see reviews from Amazon and Flipkart
                  </p>
                </div>
              </div>
            )}

            {reviewData?.results.map((result, resultIndex) => (
              <div key={resultIndex} className="mt-8">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-2">{result.productName}</h2>
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{result.source}</span>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="ml-1">{result.overallRating}</span>
                      </div>
                    </div>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      View Product <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.reviews.map((review, index) => (
                    <div key={index} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{review.title}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{review.text}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{review.date}</span>
                        {review.verified && (
                          <span className="text-green-600 flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}