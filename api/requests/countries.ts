import { RequestDescriptor } from "../api";

const CountriesRequests = {
  getAllCountries(): RequestDescriptor {
    return {
      url: "https://restcountries.com/v3.1/all",
    };
  },
};

export default CountriesRequests;
