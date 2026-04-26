import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fire Banking',
  description: '부부가 함께 순자산과 경제적 자유 진척을 확인하는 월간 체크인 앱',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
