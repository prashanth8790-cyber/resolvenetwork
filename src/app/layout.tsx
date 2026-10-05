import type { Metadata } from 'next';
import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CivicConnect — Crowd-Sourced Civic Issue Reporting & Resolution',
  description: 'Empowering citizens and municipal authorities to report, track, and resolve neighborhood infrastructure issues together.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 flex flex-col min-h-screen">
        <ReactQueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
