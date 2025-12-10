
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { themeStore } from './app/lib/stores/theme';
import Index from './app/routes/_index';

import '@unocss/reset/tailwind-compat.css';
import 'react-toastify/dist/ReactToastify.css';
import 'virtual:uno.css';
import './app/styles/index.scss';
import '@xterm/xterm/css/xterm.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
]);

export default function App() {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return <RouterProvider router={router} />;
}
