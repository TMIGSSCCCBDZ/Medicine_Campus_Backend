import type React from "react"
import type { Metadata } from "next"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Course Management Dashboard",
  description: "Admin dashboard for managing online courses",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <ClerkProvider>

    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </div>
      </body>
    </html>
        </ClerkProvider>

  )
}
