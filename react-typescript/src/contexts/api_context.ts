import React from "react";

import Api from "../api/api";

const apiContext = React.createContext<Api>(
  new Api(process.env.NEXTJS_PUBLIC_API_BASE_URL ?? "")
);

export default apiContext;
