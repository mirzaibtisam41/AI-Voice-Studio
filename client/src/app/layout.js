import { Fraunces, JetBrains_Mono, Manrope } from 'next/font/google';
import { Providers } from '@/app/providers';
import { REMOVE_EXTENSION_ATTRIBUTES_SCRIPT } from '@/lib/extensionAttributes';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: {
    default: 'AI Voice Studio',
    template: '%s · AI Voice Studio',
  },
  description:
    'Text to speech, transcription and real-time voice agents in one studio with one credit balance',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${manrope.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT + REMOVE_EXTENSION_ATTRIBUTES_SCRIPT,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
