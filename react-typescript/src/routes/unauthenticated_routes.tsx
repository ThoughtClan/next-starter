import { Route, Routes } from "react-router";

import Login from "./Login";

export default function UnauthenticatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
}
