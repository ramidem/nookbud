import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nookbud',
  description: 'The calm between two homes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
