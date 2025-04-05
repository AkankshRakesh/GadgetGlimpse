import { CheckCircle, XCircle } from "lucide-react"
import { StarRating } from "./star-rating"

interface ReviewProps {
  product: string
  review: {
    overview: string
    price?: string // Make price optional
    key_features: string[]
    performance: Record<string, string>
    pros: string[]
    cons: string[]
    final_rating: number
  }
}

export function ReviewCard({ product, review }: ReviewProps) {
  const { overview, price, key_features, performance, pros, cons, final_rating } = review

  return (
    <div className="bg-gray-800/80 rounded-xl p-5 shadow-lg border border-purple-500/20">
      <div className="flex justify-between items-start">
        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r bg-clip-text from-pink-500 to-purple-500">
          {product} Review
        </h2>
        
        {price && (
          <div className="bg-purple-600/20 px-3 py-1 rounded-full border border-purple-500/30">
            <span className="font-semibold text-purple-300 text-sm md:text-base">
              {price}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-gray-300 text-sm md:text-base">
        <strong className="text-purple-300">Overview:</strong> {overview}
      </p>

      <div className="mt-5">
        <h3 className="text-base md:text-lg font-semibold text-purple-400 flex items-center">
          <span className="bg-purple-500/20 p-1 rounded mr-2">
            <CheckCircle className="w-4 h-4" />
          </span>
          Key Features
        </h3>
        <ul className="list-none space-y-2 text-gray-300 mt-2 pl-2">
          {key_features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2 mt-1">
                <CheckCircle className="w-full h-full" />
              </div>
              <div className="text-sm md:text-base">{feature}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h3 className="text-base md:text-lg font-semibold text-purple-400 flex items-center">
          <span className="bg-purple-500/20 p-1 rounded mr-2">
            <CheckCircle className="w-4 h-4" />
          </span>
          Performance
        </h3>
        <ul className="list-none space-y-2 text-gray-300 mt-2 pl-2">
          {Object.entries(performance).map(([key, value]) => (
            <li key={key} className="flex items-start">
              <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2 mt-1">
                <CheckCircle className="w-full h-full" />
              </div>
              <div className="text-sm md:text-base">
                <strong className="text-purple-300">{key}:</strong> {value}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-purple-400 flex items-center">
            <span className="bg-green-500/20 p-1 rounded mr-2">
              <CheckCircle className="w-4 h-4" />
            </span>
            Pros
          </h3>
          <ul className="list-none space-y-2 text-gray-300 mt-2 pl-2">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-4 h-4 text-green-400 mr-2 mt-1">
                  <CheckCircle className="w-full h-full" />
                </div>
                <div className="text-sm md:text-base">{pro}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base md:text-lg font-semibold text-purple-400 flex items-center">
            <span className="bg-red-500/20 p-1 rounded mr-2">
              <XCircle className="w-4 h-4" />
            </span>
            Cons
          </h3>
          <ul className="list-none space-y-2 text-gray-300 mt-2 pl-2">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-4 h-4 text-red-400 mr-2 mt-1">
                  <XCircle className="w-full h-full" />
                </div>
                <div className="text-sm md:text-base">{con}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center mt-5">
        <StarRating rating={final_rating} />
      </div>
    </div>
  )
}