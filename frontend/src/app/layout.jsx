import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'ResumeIQ — Make your resume easier to shortlist',
  description: 'A focused resume review workspace for clearer structure, stronger evidence, and better job alignment.',
  keywords: 'resume review, ATS check, resume feedback, job application',
  authors: [{ name: 'ResumeIQ' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
