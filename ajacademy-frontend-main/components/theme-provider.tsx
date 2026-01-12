'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // useEffect runs only on the client, so this ensures the component is only rendered after it's mounted
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by not rendering the theme provider until the client is mounted
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
