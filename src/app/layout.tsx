import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Strangerly – Meet. Talk. Connect.',
  description: 'Talk to someone new instantly. Strangerly lets you connect with people around the world via text, voice, or video chat. Instant, safe, and anonymous.',
  icons: {
    icon: '/assets/logo.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Razorpay Checkout Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}