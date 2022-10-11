import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";

import ApiProvider from "../providers/api_provider";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApiProvider>
      <Component {...pageProps} />
    </ApiProvider>
  );
}

export default appWithTranslation(MyApp);
