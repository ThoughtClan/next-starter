import { RequestDescription } from "../api";

const CountriesRequests = {
  getAllCountries(): RequestDescription {
    return {
      url: "https://restcountries.com/v3.1/all",
    };
  },
};

export default CountriesRequests;
