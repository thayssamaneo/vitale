import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vitale — Triagem Acessível de Sintomas e Apoio à Saúde',
  description:
    'Plataforma web acessível e intuitiva para acompanhamento de sintomas, recomendações de bem-estar e contatos de emergência.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakartaSans.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0..1,0&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
