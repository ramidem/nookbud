import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--nb-sans' });

const description =
  'Shared care records for families raising a child across homes. Organize schedules, track expenses and keep a clear record, whether you’re co-parenting after separation, working overseas or managing a blended family.';

export const metadata: Metadata = {
  title: 'Nookbud — Two homes. One childhood.',
  description,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Nookbud — Two homes. One childhood.',
    description,
    siteName: 'Nookbud',
    type: 'website',
    url: 'https://nookbud.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nookbud — Two homes. One childhood.',
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
