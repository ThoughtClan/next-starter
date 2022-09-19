import React, { ReactNode, useRef } from "react";

import Api from "../api/api";
import AuthProvider from "../interfaces/auth_provider";

const ApiContext = React.createContext<Api>(
  new Api(process.env.NEXTJS_PUBLIC_API_BASE_URL ?? "")
);

export default ApiContext;

type AuthProviderProps = {
  children: ReactNode;
  baseUrl?: string;
  authProvider?: AuthProvider;
};

/**
 * A higher order component for hoisting a common @see Api instance to all child components. This instance can be easily retrieved
 * with the @see useApi hook.
 */
export function ApiProvider({
  children,
  baseUrl,
  authProvider,
}: AuthProviderProps) {
  const apiRef = useRef<Api>(
    new Api(baseUrl ?? process.env.NEXTJS_PUBLIC_API_BASE_URL ?? "", authProvider)
  );

  return (
    <ApiContext.Provider value={apiRef.current}>{children}</ApiContext.Provider>
  );
}
