'use client';

import Link from 'next/link';
import { Bot, ArrowRight, ArrowLeft } from 'lucide-react';
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

export default function ChooseTool() {
  return (
    <main className="h-full">
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
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white"
            >
              Select Your Experience
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 mb-8">
              Choose between our powerful web scraper or an interactive chatbot to enhance your experience.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-b from-black to-purple-950">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="flex flex-col md:flex-row justify-center gap-8"
          >
            <motion.div 
              variants={fadeInUp} 
              className="flex-1"
            >
              <Link 
                href="/webScraper" 
                className="block text-center bg-gradient-to-r from-pink-900 to-black via-purple-900 text-white px-8 py-5 rounded-lg text-3xl font-semibold shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 relative border border-transparent hover:border-gray-300"
                aria-label="Choose Web Scraper"
              >
                Web Scraper
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
                <span className="block text-sm mt-2">Extract data from websites effortlessly.</span>
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp} 
              className="flex-1"
            >
              <Link 
                href="/chatbot" 
                className="block text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-5 rounded-lg text-3xl font-semibold shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 relative border border-transparent hover:border-gray-300"
                aria-label="Choose Chatbot"
              >
                Chatbot
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
                <span className="block text-sm mt-2">Engage with our interactive chatbot for assistance.</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}