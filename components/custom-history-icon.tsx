import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export const CustomHistoryIcon = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 float-animation">
        <Clock className="h-8 w-8 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
    </div>
  )
}
