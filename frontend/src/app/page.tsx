import Link from 'next/link';
import { Bot, Star, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">GadgetReviewBot</span>
            </div>
            <Link 
              href="/bot"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Try Now
            </Link>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Make Smarter Purchase Decisions
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Analyze product reviews across multiple shopping sites instantly. Get comprehensive insights before making your purchase.
            </p>
            <Link
              href="/bot"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition text-lg"
            >
              Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose GadgetReviewBot?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-50">
              <ShoppingBag className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Platform Analysis</h3>
              <p className="text-gray-600">Compare reviews from multiple shopping sites in one place</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <Star className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
              <p className="text-gray-600">Get detailed analysis of product ratings and reviews</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50">
              <Bot className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Advanced AI technology for accurate review analysis</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}