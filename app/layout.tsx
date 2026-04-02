import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gewiss Projects | Electric Project Tracker',
  description: 'Track and manage electrical projects with Gewiss solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
