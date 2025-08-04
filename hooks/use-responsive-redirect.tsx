"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface UseResponsiveRedirectOptions {
  enableAutoRedirect?: boolean
  mobileBreakpoint?: number
  preserveSearchParams?: boolean
}

export function useResponsiveRedirect({
  enableAutoRedirect = true,
  mobileBreakpoint = 768,
  preserveSearchParams = true,
}: UseResponsiveRedirectOptions = {}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < mobileBreakpoint
      setIsMobile(mobile)

      if (!isInitialized) {
        setIsInitialized(true)
        return
      }

      if (!enableAutoRedirect) return

      const currentParams = preserveSearchParams ? `?${searchParams.toString()}` : ""

      // Auto-redirect logic
      if (mobile && pathname === "/") {
        router.push(`/mobile${currentParams}`)
      } else if (!mobile && pathname === "/mobile") {
        router.push(`/${currentParams}`)
      }
    }

    // Initial check
    checkScreenSize()

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize)
    window.addEventListener("orientationchange", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
      window.removeEventListener("orientationchange", checkScreenSize)
    }
  }, [enableAutoRedirect, mobileBreakpoint, preserveSearchParams, router, pathname, searchParams, isInitialized])

  return { isMobile, isInitialized }
}
