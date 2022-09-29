export default class RequestError extends Error {
  code: string;

  statusCode: number;

  serverErrorCode: string | null;

  message: string;

  data: any;

  constructor(
    code: string,
    statusCode: number,
    message: string,
    data: any = null
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.serverErrorCode = data?.errorCode;
  }
}
