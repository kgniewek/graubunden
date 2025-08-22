import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { LocaleProvider } from './locale-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Graubünden Gallery - Beautiful Locations Interactive Map | graubunden.best',
  description: 'Discover stunning locations in and around Graubünden, Switzerland through our interactive photo gallery map. Explore hiking trails, mountain peaks, lakes, and scenic viewpoints with detailed location information, difficulty ratings, and elevation data.',
  keywords: [
    'Graubünden',
    'Grisons', 
    'Switzerland',
    'Swiss Alps',
    'hiking',
    'mountain hiking',
    'alpine hiking',
    'photo gallery',
    'interactive map',
    'travel guide',
    'tourism',
    'scenic locations',
    'mountain peaks',
    'lakes',
    'trails',
    'outdoor activities',
    'nature photography',
    'Swiss tourism',
    'Engadin',
    'Davos',
    'St. Moritz',
    'Pontresina',
    'Samedan',
    'Silvaplana'
  ].join(', '),
  authors: [{ name: 'Graubünden Gallery', url: 'https://graubunden.best' }],
  creator: 'Graubünden Gallery',
  publisher: 'Graubünden Gallery',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://graubunden.best',
    languages: {
      'en': 'https://graubunden.best',
      'de': 'https://graubunden.best',
      'it': 'https://graubunden.best',
      'fr': 'https://graubunden.best'
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['de_DE', 'it_IT', 'fr_FR'],
    url: 'https://graubunden.best',
    siteName: 'Graubünden Gallery',
    title: 'Graubünden Gallery - Beautiful Locations Interactive Map',
    description: 'Discover stunning locations in and around Graubünden, Switzerland through our interactive photo gallery map. Explore hiking trails, mountain peaks, lakes, and scenic viewpoints.',
    images: [
      {
        url: 'https://graubunden.best/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Beautiful mountain landscape in Graubünden, Switzerland'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@graubunden_best',
    creator: '@graubunden_best',
    title: 'Graubünden Gallery - Beautiful Locations Interactive Map',
    description: 'Discover stunning locations in and around Graubünden, Switzerland through our interactive photo gallery map.',
    images: ['https://graubunden.best/og-image.jpg']
  },
  verification: {
    google: 'your-google-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code'
    }
  },
  category: 'travel',
  classification: 'Tourism and Travel Guide',
  other: {
    'geo.region': 'CH-GR',
    'geo.placename': 'Graubünden, Switzerland',
    'geo.position': '46.6;9.8'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="icon" href="/favicon.ico" sizes="64x64" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
