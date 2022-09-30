import { BrowserRouter } from "react-router-dom";

import ApiProvider from "./providers/api_provider";
import AuthProvider from "./providers/auth_provider";
import AuthenticatedRoutes from "./routes/authenticated_routes";
import UnauthenticatedRoutes from "./routes/unauthenticated_routes";

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <AuthProvider>
          {(context) =>
            context.isAuthenticated ? (
              <AuthenticatedRoutes />
            ) : (
              <UnauthenticatedRoutes />
            )
          }
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
