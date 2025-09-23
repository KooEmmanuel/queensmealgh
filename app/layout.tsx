import type React from "react"
import "@/app/globals.css"
import { Montserrat, Playfair_Display, Source_Sans_3, Karla } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar"


// Font configurations
const montserrat = Montserrat({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

const sourceSans = Source_Sans_3({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sourcesans',
})

const karla = Karla({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-karla',
})

export const metadata = {
  title: "Flavoriz - Adventure of Delicacies",
  description: "Unlock a world of variety culinary recipes and unleash your inner chef the easy way with Flavoriz.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${playfair.variable} ${sourceSans.variable} ${karla.variable}`}>
      <body className={`${montserrat.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}


import './globals.css'