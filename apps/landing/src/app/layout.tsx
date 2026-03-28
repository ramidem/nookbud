import type { Metadata, Viewport } from 'next';
import './global.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'NookBud — Two homes. One childhood.',
  description:
    'The shared care records platform for every family structure. Organize schedules, track expenses, and build tamper-proof records — whether you\u2019re co-parenting after separation, working overseas, or managing a blended family.',
  openGraph: {
    title: 'NookBud — Two homes. One childhood.',
    description:
      'The shared care records platform for every family structure. Tamper-proof records, shared schedules, and court-ready exports.',
    url: 'https://nookbud.com',
    siteName: 'NookBud',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NookBud — Two homes. One childhood.',
    description:
      'The shared care records platform for every family structure.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
