import { BrowserRouter } from "react-router-dom";

import ApiProvider from "./providers/api_provider";
import AuthenticatedRoutes from "./routes/authenticated_routes";

function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <AuthenticatedRoutes />
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
