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
  title: "Project Shaoor - Connecting Hearts, Changing Lives",
  description: "A platform connecting orphanages and schools with volunteers for virtual teaching",
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
