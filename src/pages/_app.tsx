import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import Error from "root/components/Error";
import "tailwindcss/tailwind.css";
import "root/styles/defaults.css";

function App({ Component, pageProps }) {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default App;
