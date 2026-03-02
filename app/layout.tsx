import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://games-khane.vercel.app'),
  title: 'Games Khane',
  description: 'All-in-one party games: Truth or Dare, Would You Rather, Most Likely To, challenges, and more.',
  manifest: '/site.webmanifest',
  themeColor: '#0f0f14',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: 'Games Khane',
    description: 'Instant party fun. Pick a game and pass the phone.',
    type: 'website',
    images: [{ url: '/android-icon-192x192.png' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games Khane',
    description: 'Instant party games in one app.',
    images: ['/android-icon-192x192.png']
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="site-shell">
          <div className="site-content">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
