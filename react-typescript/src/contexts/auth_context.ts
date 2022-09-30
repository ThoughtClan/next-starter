import React from "react";

import User from "../types/user";

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  setUser: () => {
    throw new Error("Not implemented!");
  },
  isAuthenticated: false,
});

export default AuthContext;
