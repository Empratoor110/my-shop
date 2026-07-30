import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'My Shop',
  description: 'فروشگاه بذر و نهاده‌ها',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="app-root">{children}</body>
    </html>
  )
}
