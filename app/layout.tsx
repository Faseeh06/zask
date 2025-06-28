import type React from "react"
import type { Metadata } from "next"
import { Poiret_One, Ephesis } from "next/font/google"
import "./globals.css"

const poiretOne = Poiret_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poiret-one",
})

const ephesis = Ephesis({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ephesis",
})

export const metadata: Metadata = {
  title: "Zask - Smart Task Management Platform",
  description: "A collaborative project management platform for teams and organizations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poiretOne.variable} ${ephesis.variable} ${poiretOne.className}`}>{children}</body>
    </html>
  )
}
