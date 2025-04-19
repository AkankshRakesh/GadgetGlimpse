"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  size = "md",
  showText = true,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7
  const hasAlmostFullStar = rating % 1 > 0.7
  const emptyStars = 5 - fullStars - (hasHalfStar || hasAlmostFullStar ? 1 : 0)

  // Size mappings
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const starSize = sizeClasses[size]
  const containerSize = size === "sm" ? "h-6" : size === "md" ? "h-8" : "h-10"

  // Format rating for display
  const displayRating = rating

  // Handle interactive rating
  const handleStarClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div
      className={cn("flex items-center gap-2", interactive ? "cursor-pointer" : "", className)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {showText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          )}
        >
          {displayRating}
        </motion.span>
      )}

      <div className={cn("flex items-center relative", containerSize)}>
        {/* Background stars (gray) */}
        <div className="flex absolute">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={`bg-${i}`} className={cn(starSize, "text-gray-600 fill-gray-700/30 mr-0.5")} />
          ))}
        </div>

        {/* Foreground stars (colored) with clip paths */}
        <div className="flex absolute">
          {Array.from({ length: fullStars }, (_, i) => (
            <motion.div
              key={`full-${i}`}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              onClick={() => handleStarClick(i)}
            >
              <Star
                className={cn(
                  starSize,
                  "text-amber-400 fill-amber-400 mr-0.5 drop-shadow-md",
                  interactive ? "hover:text-amber-300 hover:fill-amber-300 transition-colors" : "",
                )}
              />
            </motion.div>
          ))}

          {hasHalfStar && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: fullStars * 0.1, duration: 0.3 }}
              className="relative"
              onClick={() => handleStarClick(fullStars)}
            >
              <div className="relative">
                <Star
                  className={cn(starSize, "text-amber-400 fill-amber-400 mr-0.5 drop-shadow-md")}
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
                <Star
                  className={cn(starSize, "absolute top-0 left-0 text-gray-600 fill-gray-700/30 mr-0.5")}
                  style={{ clipPath: "inset(0 0 0 50%)" }}
                />
              </div>
            </motion.div>
          )}

          {hasAlmostFullStar && (
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: fullStars * 0.1, duration: 0.3 }}
              className="relative"
              onClick={() => handleStarClick(fullStars)}
            >
              <div className="relative">
                <Star
                  className={cn(starSize, "text-amber-400 fill-amber-400 mr-0.5 drop-shadow-md")}
                  style={{ clipPath: "inset(0 25% 0 0)" }}
                />
                <Star
                  className={cn(starSize, "absolute top-0 left-0 text-gray-600 fill-gray-700/30 mr-0.5")}
                  style={{ clipPath: "inset(0 0 0 75%)" }}
                />
              </div>
            </motion.div>
          )}

          {Array.from({ length: emptyStars }, (_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (fullStars + (hasHalfStar || hasAlmostFullStar ? 1 : 0) + i) * 0.1, duration: 0.3 }}
              onClick={() => handleStarClick(fullStars + (hasHalfStar || hasAlmostFullStar ? 1 : 0) + i)}
            >
              <Star
                className={cn(
                  starSize,
                  "text-gray-600 fill-gray-700/30 mr-0.5",
                  interactive ? "hover:text-gray-500 hover:fill-gray-600/30 transition-colors" : "",
                )}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
