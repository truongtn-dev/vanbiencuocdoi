import React from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata = {
  title: 'Vạn Biến Cuộc Đời',
  description: 'Mỗi lựa chọn mở ra một ngã rẽ mới. Tự tay định hình hành trình cuộc đời theo cách của bạn.',
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
