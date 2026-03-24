import './global.css';

export const metadata = {
  title: 'Coparent Design System',
  description: 'Shared design tokens and UI components',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
