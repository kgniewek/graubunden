import { ClientLayout } from './client-layout';

import dynamic from 'next/dynamic';

// Dynamically import ClientLayout with no SSR
const ClientLayout = dynamic(
  () => import('./client-layout').then((mod) => ({ default: mod.ClientLayout })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
);

export default function Home() {
  return <ClientLayout />;
}