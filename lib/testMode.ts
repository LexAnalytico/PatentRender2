/**
 * Test mode utilities
 * Used to detect if the app is running in test/development mode
 */

export function isTestMode(): boolean {
  // Check if running in test mode based on environment or URL
  if (typeof window === 'undefined') return false
  
  // Check for test query parameter
  const url = new URL(window.location.href)
  if (url.searchParams.has('test')) return true
  
  // Check for test hostname patterns
  if (window.location.hostname === 'localhost') return true
  if (window.location.hostname.includes('test')) return true
  
  // Check for development environment
  if (process.env.NODE_ENV === 'development') return false // Disabled in dev by default
  
  return false
}
