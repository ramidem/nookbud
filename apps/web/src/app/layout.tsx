import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './global.css';

const inter = Inter({ subsets: ['latin'], variable: '--nb-sans' });

const description =
  "Nookbud keeps one shared place for a child's well-being: the schedule, the tasks, and the money spent on the child. Parents, grandparents, and guardians keep it together. A parent abroad sees the same week. A lawyer can be invited to read it.";

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: 'cover',
  width: 'device-width',
};

export const metadata: Metadata = {
  title: 'Nookbud — For the kids.',
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
    title: 'Nookbud — For the kids.',
    description,
    siteName: 'Nookbud',
    type: 'website',
    url: 'https://nookbud.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nookbud — For the kids.',
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
