import '@/styles/globals.css';
import type { Metadata } from 'next';
import { VoiceProvider } from './providers/VoiceProvider/VoiceProvider';

export const metadata: Metadata = {
  title: 'Voice-Enabled Bank Transfer',
  description: 'Securely transfer money using voice commands',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <VoiceProvider>{children}</VoiceProvider>
      </body>
    </html>
  );
}