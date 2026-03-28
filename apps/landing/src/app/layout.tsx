import type { Metadata } from 'next';
import './global.css';

export const metadata: Metadata = {
  title: 'Nookbud — Two homes. One childhood.',
  description:
    'Nookbud helps co-parents stay organized, communicate clearly, and keep the focus on what matters.',
  openGraph: {
    title: 'Nookbud — Two homes. One childhood.',
    description:
      'Nookbud helps co-parents stay organized, communicate clearly, and keep the focus on what matters.',
    url: 'https://nookbud.com',
    siteName: 'Nookbud',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
