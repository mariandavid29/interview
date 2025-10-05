import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Providers } from '@/shared/utils/Providers';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Interview App',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} text-foreground bg-background antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
