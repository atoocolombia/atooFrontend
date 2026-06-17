import { RouterProvider } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { router } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export default function App() {
  const app = (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );

  if (!googleClientId) {
    return app;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>;
}