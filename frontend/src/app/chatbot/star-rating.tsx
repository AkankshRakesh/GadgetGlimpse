import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
}

export function StarRating({ rating }: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center mt-4 bg-gray-900/50 p-3 rounded-lg">
      <span className="mr-3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
        {rating}/5
      </span>
      {Array.from({ length: fullStars }, (_, index) => (
        <Star key={`full-${index}`} className="w-6 h-6 fill-yellow-500 text-yellow-500 mr-1" />
      ))}
      {hasHalfStar && (
        <div className="relative w-6 h-6 mr-1">
          <Star className="absolute w-6 h-6 text-yellow-500" style={{ clipPath: "inset(0 50% 0 0)" }} />
          <Star className="absolute w-6 h-6 fill-gray-800 text-gray-400" style={{ clipPath: "inset(0 0 0 50%)" }} />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, index) => (
        <Star key={`empty-${index}`} className="w-6 h-6 fill-gray-800 text-gray-400 mr-1" />
      ))}
    </div>
  )
}

