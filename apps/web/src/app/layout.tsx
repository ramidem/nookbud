import './global.css';

export const metadata = {
  title: 'Nookbud',
  description: 'Shared care records for families raising a child across homes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
