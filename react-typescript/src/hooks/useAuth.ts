import { useContext } from "react";

import AuthContext, { AuthContextType } from "../contexts/auth_context";

export default function useAuth(): AuthContextType {
  const value = useContext(AuthContext);

  return value;
}
