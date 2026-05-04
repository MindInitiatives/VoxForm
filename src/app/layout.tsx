import '@/styles/globals.css';
import type { Metadata } from 'next';
import { VoiceProvider } from './providers/VoiceProvider/VoiceProvider';
import { ThemeProvider } from './providers/ThemeProvider/ThemeProvider';

export const metadata: Metadata = {
  title: 'VoxForm - Voice-Enabled Bank Transfer',
  description: 'Your voice is the shortest path between thought and form',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <VoiceProvider>
            {children}
          </VoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
