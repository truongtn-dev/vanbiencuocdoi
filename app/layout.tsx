import React from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata = {
  title: 'Vạn Biến Cuộc Đời',
  description: 'Viết nên câu chuyện của riêng bạn qua từng quyết định. Cuộc sống là một cuộc hành trình vạn biến.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
