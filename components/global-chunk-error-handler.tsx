"use client"

import { useEffect } from "react"

/**
 * Reloads the page once if a dynamic‐imported JS chunk can’t be fetched.
 * This is the same behaviour recommended by the Next.js docs for handling
 * `Loading chunk NNN failed` errors that happen after a new deployment.
 */
export function GlobalChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // The message is browser-dependent, so we just look for the
      // “Loading chunk” phrase that Webpack emits.
      if (event?.message?.includes("Loading chunk")) {
        // Avoid an endless loop by checking sessionStorage
        if (sessionStorage.getItem("chunk-reload") === "done") return
        sessionStorage.setItem("chunk-reload", "done")
        window.location.reload()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  return null
}
