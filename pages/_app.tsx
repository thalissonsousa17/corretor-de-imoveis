import GoogleMapsProvider from "@/components/GoogleMapsWrapper";
import { AuthProvider } from "@/lib/AuthContext";
import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return (
    <AuthProvider>
      <GoogleMapsProvider />
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;
