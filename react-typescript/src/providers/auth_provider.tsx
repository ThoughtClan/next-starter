import { ReactNode, useEffect, useMemo, useState } from "react";

import AuthContext, { AuthContextType } from "../contexts/auth_context";
import User from "../types/user";

type AuthProviderProps = {
  children: ReactNode | ((value: AuthContextType) => ReactNode);
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const value: AuthContextType = useMemo(() => {
    return { user, setUser, isAuthenticated: Boolean(user) };
  }, [JSON.stringify(user), setUser]);

  useEffect(() => {
    // TODO: add user session restoration here
    const persistedUser = localStorage.getItem("user");

    if (persistedUser) {
      setUser(JSON.parse(persistedUser));
    }
  }, []);

  const content: ReactNode =
    typeof children === "function" ? (children(value) as ReactNode) : children;

  return <AuthContext.Provider value={value}>{content}</AuthContext.Provider>;
}
