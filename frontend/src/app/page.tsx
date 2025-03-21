'use client';

import Link from 'next/link';
import { Bot, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="bg-gradient-to-b from-purple-950 to-black">
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
              className='hidden lg:block'
            >
              <Link 
                href="/bot"
                className="group bg-gradient-to-r from-pink-700 to-purple-700 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg inline-flex items-center"
                aria-label="Try Now"
              >
                Try Now
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.nav>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white"
            >
              Make <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">Smarter</span> Purchase Decisions
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8">
              Analyze product reviews across multiple shopping sites instantly. Get comprehensive insights before making your purchase.
            </motion.p>
            <motion.div 
              variants={fadeInUp} 
              whileHover={{ scale: 1.05 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href="/bot"
                className="inline-flex items-center bg-gradient-to-r from-purple-700 to-pink-700 text-white px-8 py-3 rounded-full hover:opacity-90 transition text-lg shadow-md"
                aria-label="Start Analyzing"
              >
                Start Analyzing <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-b from-black to-purple-950">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"
          >
            Why Choose GadgetGlimpse?
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[ 
              { icon: ShoppingBag, title: 'Multi-Platform Analysis', description: 'Compare reviews from multiple shopping sites in one place' },
              { icon: Star, title: 'Smart Insights', description: 'Get detailed analysis of product ratings and reviews' },
              { icon: Bot, title: 'AI-Powered', description: 'Advanced AI technology for accurate review analysis' }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp} 
                className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg border border-gray-700 transition-transform hover:scale-105"
              >
                <feature.icon className="w-12 h-12 text-purple-600  mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white ">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}