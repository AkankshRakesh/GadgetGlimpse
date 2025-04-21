"use client"

import type React from "react"

import Link from "next/link"
import { Bot, ArrowRight, ArrowLeft, Sparkles, Globe, Replace } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const fadeInUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.3,
    },
  },
}

export default function ChooseTool() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 via-black to-purple-950 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-8 py-8 relative z-10">
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
          className="max-w-4xl mx-auto text-center mb-16 md:mb-24"
        >
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white">
              Select Your Experience
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Choose between our powerful web scraper or an interactive chatbot to enhance your digital journey.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4"
        >
          <OptionCard
            href="/webScraper"
            title="Web Scraper"
            description="Extract data from websites with precision and ease. Perfect for research and data collection."
            icon={<Globe className="w-6 h-6" />}
            gradient="from-indigo-600 to-purple-800"
            hoverGradient="from-indigo-500 to-purple-700"
            delay={0.3}
          />

          <OptionCard
            href="/chatbot"
            title="Chatbot"
            description="Engage with our AI-powered assistant for instant help and information on any topic."
            icon={<Sparkles className="w-6 h-6" />}
            gradient="from-pink-600 to-purple-800"
            hoverGradient="from-pink-500 to-purple-700"
            delay={0.5}
            featured={true}
          />
          <OptionCard
            href="/comparator"
            title="Product Comparator"
            description="Let our AI-powered assistant help you compare products and make informed decisions."
            icon={<Replace className="w-6 h-6" />}
            gradient="from-pink-600 to-purple-800"
            hoverGradient="from-pink-500 to-purple-700"
            delay={0.5}
            featured={true}
          />
        </motion.div>
      </div>
    </main>
  )
}

interface OptionCardProps {
  href: string
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  hoverGradient: string
  delay?: number
  featured?: boolean
}

function OptionCard({
  href,
  title,
  description,
  icon,
  gradient,
  hoverGradient,
  delay = 0,
  featured = false,
}: OptionCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6, delay }}
      className="group relative h-full"
    >
      <Link href={href} className="h-full">
        <div className="absolute inset-0.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        <div
          className={cn(
            "relative h-full bg-gradient-to-r p-px rounded-2xl overflow-hidden transition-all duration-500",
            `bg-gradient-to-r ${gradient}`,
            `group-hover:${hoverGradient}`,
          )}
        >
          <div className="bg-black/80 rounded-2xl h-full p-8 flex flex-col items-center text-center transition-transform duration-300 group-hover:scale-[0.99]">
            
            {/* "Recommended" Badge positioned better */}
            {featured && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md">
                Recommended
              </div>
            )}

            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-gray-900 to-black group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {icon}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-3 text-white flex items-center">
              {title}
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </h2>

            {/* Description */}
            <p className="text-gray-300 flex-grow mb-5">{description}</p>

            {/* CTA Button */}
            <div className="mt-auto">
              <span className="inline-flex items-center justify-center py-2 px-4 rounded-full bg-white/10 text-sm font-medium text-white group-hover:bg-white/20 transition-all duration-300">
                Get Started
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

