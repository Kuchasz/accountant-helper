import { RouterProvider } from '@tanstack/react-router';
import { DocumentHead } from './components/DocumentHead';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DocumentHead />
        <RouterProvider router={router} />
      </LanguageProvider>
    </ThemeProvider>
  );
}
