"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { memo } from "react"

interface PageTransitionWrapperProps {
  children: React.ReactNode
}

const PageTransitionWrapper = memo(function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname()

  return <div className="min-h-screen flex flex-col">{children}</div>
})

export default PageTransitionWrapper
