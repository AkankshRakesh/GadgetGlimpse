"use client"

import Link from "next/link"
import { Bot, Star, ShoppingBag, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function Home() {
  const [backgroundShapes, setBackgroundShapes] = useState<
    { x: number; y: number; width: number; height: number; opacity: number; left: string; top: string }[]
  >([]);

  useEffect(() => {
    const newShapes = [...Array(5)].map(() => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      opacity: 0.1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setBackgroundShapes(newShapes);
  }, []); // Runs once on the client
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with improved background */}
      <div className="relative bg-gradient-to-b from-purple-950 via-purple-900 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundShapes.map((shape, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl"
              initial={{
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                opacity: shape.opacity,
              }}
              animate={{
                x: shape.x,
                y: shape.y,
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 15 + i * 5,
                repeatType: "reverse",
              }}
              style={{
                left: shape.left,
                top: shape.top,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center md:justify-between items-center mb-12 lg:mb-20"
          >
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-16 h-16 lg:w-8 lg:h-8 text-pink-500" />
                  <motion.div
                    className="absolute -inset-1 rounded-full bg-pink-500/20 blur-sm"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </div>
                <span className="text-2xl lg:text-xl mt-2 lg:mt-1 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                  GadgetGlimpse
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link
                href="/choice"
                className="group hidden md:inline-flex bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 items-center"
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
            className="max-w-4xl mx-auto text-center py-2 lg:py-2"
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="relative inline-block mb-6">
              <motion.div
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <Sparkles className="w-12 h-12 text-pink-500 mx-auto" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.7 }}
              className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight text-white"
            >
              Make{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 relative">
                Smarter
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>{" "}
              Purchase Decisions
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.8 }}
              className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Analyze product reviews across multiple shopping sites instantly. Get comprehensive insights before making
              your purchase.
            </motion.p>

            <motion.div variants={fadeInUp} transition={{ duration: 0.9 }} className="relative inline-block">
              <motion.div
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              />
              <Link
                href="/choice"
                className="group relative inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 text-lg font-medium"
                aria-label="Start Analyzing"
              >
                Start Analyzing
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 1 }}
              className="mt-12 text-sm text-gray-400 flex justify-center space-x-6"
            >
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Trusted by 10,000+ users
              </span>
              <span className="flex items-center">
                <ShoppingBag className="w-4 h-4 mr-1 text-purple-500" />
                Supports major retailers
              </span>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Features Section */}
      <div className="py-24 bg-black relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-extrabold text-center mb-14 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"
          >
            Why Choose GadgetGlimpse?
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                icon: ShoppingBag,
                title: "Multi-Platform Analysis",
                description: "Compare reviews from Amazon, Best Buy, Walmart and more - all in one place.",
                color: "from-blue-500 to-purple-500",
              },
              {
                icon: Star,
                title: "Smart Insights",
                description: "Get detailed analysis of product ratings, sentiment trends, and key features.",
                color: "from-pink-500 to-purple-500",
              },
              {
                icon: Bot,
                title: "AI-Powered",
                description: "Our advanced AI technology identifies patterns and highlights what matters most.",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.5 + index * 0.1 }}
                className="group relative cursor-pointer p-8 rounded-2xl bg-gray-900 bg-opacity-60 backdrop-blur-lg border border-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-gray-700 overflow-hidden"
              >
                <Link href="/choice">
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />

                <div className="relative z-10">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-br opacity-90">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-20`} />
                    <feature.icon
                      className={`w-8 h-8 text-white bg-clip-text bg-gradient-to-br ${feature.color}`}
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  <motion.div
                    className="mt-6 flex items-center text-sm font-medium text-purple-400 group-hover:text-pink-400 transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

