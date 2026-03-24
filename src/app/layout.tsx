import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Puisano360 — School Community Portal',
  description: 'Connecting parents, teachers and schools across Botswana.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
