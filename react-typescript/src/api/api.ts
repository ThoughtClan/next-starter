import RequestError from "../errors/request_error";
import AuthProvider from "../interfaces/auth_provider";

export type RequestDescription = {
  url: string;
  options?: RequestInit;
  payload?: FormData | any;
};

export enum HttpMethod {
  Get = "GET",
  Post = "POST",
  Patch = "PATCH",
  Put = "PUT",
}

export default class Api {
  private authProvider: AuthProvider | undefined;

  private baseUrl: string;

  constructor(baseUrl: string, auth?: AuthProvider) {
    this.baseUrl = baseUrl;
    this.authProvider = auth;

    console.debug(`[Api] initialised Api with base URL "${this.baseUrl}"`);
  }

  /**
   * Primary method of integrating with the server. Performs a request as per the given request description by appending necessary
   * authentication parameters and parsing the response status and JSON.
   *
   * If the `payload` parameter is an instance of @see FormData then the request header is set to me a multiplart request. Otherwise
   * it is set to be a JSON request, and the response is always expected in JSON format.
   *
   * Throws an error if the response has a status not in 200, 201 as these are deemed to be error responses within this system. In
   * these cases the status code and response JSON (if any) is appended to the error as `error.statusCode` and `error.data`
   * respectively so that appropriate error handling can be done using this information.
   *
   * @param {{ url: string, options: RequestInit, payload: object }}
   * @returns {object|null}
   */
  async performRequest<T>({
    url,
    options,
    payload,
  }: RequestDescription): Promise<T> {
    const fullUrl = `${
      url.startsWith("/") || url.startsWith("http") ? url : `/${url}`
    }`;

    const headers = await this.createRequestHeaders(options, payload);

    console.debug(
      `[Api] beginning ${options?.method || HttpMethod.Get} request to`,
      fullUrl
    );

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      body:
        typeof FormData !== "undefined" && payload instanceof FormData
          ? payload
          : JSON.stringify(payload),
    });

    if (response.status === 401) {
      Api.handleUnauthorised(response);
    }

    const responseJson = await Api.parseResponseJson(response);

    if (response.status >= 300) {
      const error = Api.createRequestError(response, responseJson);

      console.error(
        `[Api] failed to perform ${
          options?.method || HttpMethod.Get
        } request to ${fullUrl}`,
        error
      );

      throw error;
    }

    console.info(
      `[Api] successfully performed ${
        options?.method || HttpMethod.Get
      } request to ${fullUrl}`
    );

    return Api.extractEmbeddedResponseJson<T>(response, responseJson);
  }

  async performDownloadRequest({
    url,
    options,
    payload,
  }: RequestDescription): Promise<File | null> {
    const fullUrl = `${this.baseUrl}${
      url.startsWith("/") || url.startsWith("http") ? url : `/${url}`
    }`;

    console.debug("[Api] beginning download request to", fullUrl);

    const headers = await this.createRequestHeaders(options, payload);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      body:
        typeof FormData !== "undefined" && payload instanceof FormData
          ? payload
          : JSON.stringify(payload),
    });

    if (response.status === 401) {
      Api.handleUnauthorised(response);
    }

    if (response.status >= 400) {
      // An error occurred, attempt to extract error JSON
      const responseJson = await Api.parseResponseJson(response);
      const error = Api.createRequestError(response, responseJson);

      console.error(
        `[Api] Failed to perform ${
          options?.method || HttpMethod.Get
        } request to ${fullUrl}`,
        error
      );

      throw error;
    }

    console.info(
      `[Api] successfully performed ${
        options?.method || HttpMethod.Get
      } request to ${fullUrl}`
    );

    const blob = await response.blob();
    const header = response.headers.get("Content-Disposition");
    const parts = header!.split(";");
    const [, filename] = parts[1].split("=");
    const file = new File([blob], filename ?? "file");

    return file;
  }

  /**
   * Create a set of request headers to be sent with the Fetch request given the request options and payload.
   *
   * @param {object} options
   * @param {object} payload
   * @returns
   */
  private async createRequestHeaders(
    options: RequestInit | undefined,
    payload: any
  ) {
    let accessToken;

    try {
      if (this.authProvider) {
        accessToken = await this.authProvider.getToken();
      } else {
        throw new Error("No AuthProvider has been provided");
      }
    } catch (e: any) {
      console.warn(
        `[Api] unable to retrieve token from auth provider: ${e.message}; proceeding without authentication`
      );
    }

    const headers: any = {
      ...(options?.headers ?? {}),
      Accept: "application/json",
    };

    if (accessToken && accessToken !== "undefined") {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    if (!(typeof FormData !== "undefined" && payload instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  /**
   * Attempts to identify if the JSON is in the embedded format of the Spring REST Respository response and extracts the actual
   * result set from it.
   *
   * Also performs a check for the new response structure of `{ result, data }` and attempts to return the data if successful, otherwise
   * throws an error wrapped around the given data.
   *
   * @param {Response} response
   * @param {object} json
   * @returns {object}
   */
  private static extractEmbeddedResponseJson<T>(
    response: Response,
    json: any
  ): T {
    /* eslint-disable no-underscore-dangle */
    if (!json) {
      return json;
    }

    if (json._embedded) {
      const embeddedContent = json._embedded;

      if (Object.entries(embeddedContent).length > 1) {
        // If there are multiple embedded keys then it might have been an aggregation request and all the keys will be needed;
        // return the embedded content as it is in that situtation
        return embeddedContent as T;
      }

      // Otherwise extract the content of the only key and return
      return Object.values(embeddedContent).pop() as T;
    }

    // Handling for new API response structure
    if (
      typeof json.result === "string" &&
      (typeof json.data === "object" || typeof json.error === "object")
    ) {
      if (json.result === "SUCCESS") {
        return json.data;
      }

      if (json.result === "FAILURE") {
        const error = new RequestError(
          "E_REMOTE_OPERATION_FAILED",
          response.status,
          json.error?.message || "Request failed"
        );

        error.code = "E_REMOTE_OPERATION_FAILED";
        error.data = json.error;
        error.serverErrorCode = json.error.code;

        throw error;
      }
    }

    return json;
    /* eslint-enable no-underscore-dangle */
  }

  private static async parseResponseJson(response: any) {
    let responseJson = null;

    try {
      responseJson = await response.json();
    } catch (e) {
      console.error(
        "[Api] error parsing response JSON; proceeding with null",
        e
      );
      responseJson = null;
    }

    return responseJson;
  }

  private static createRequestError(
    response: Response,
    data: any
  ): RequestError {
    let extractedData;

    try {
      extractedData = Api.extractEmbeddedResponseJson(response, data) as any;
      // eslint-disable-next-line no-empty
    } catch (e: any) {
      return e;
    }

    const error = new RequestError(
      "E_REQUEST_FAILED",
      response.status,
      data?.message || extractedData?.message || "Network request failed",
      extractedData
    );

    return error;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static handleUnauthorised(response: any) {
    // TODO: add global session expiry here
    throw new Error("Not implemented");
  }
}

/**
 * A default @see Api instance that can be used in `getServerSideProps`.
 */
export const DefaultApi = new Api(process.env.API_BASE_URL ?? "");
