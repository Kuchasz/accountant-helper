import { RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { router } from './router';

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
