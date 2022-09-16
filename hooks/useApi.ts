import { useContext } from "react";

import Api from "../api/api";
import ApiContext from "../contexts/ApiContext";

export default function useApi(): Api {
  const api: Api = useContext<Api>(ApiContext);

  return api;
}
