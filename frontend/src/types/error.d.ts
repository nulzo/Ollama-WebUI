export interface MessageError {
  InvalidAccessCode: 'InvalidAccessCode';
  InvalidClerkUser: 'InvalidClerkUser';
  BadRequest: 400;
  Unauthorized: 401;
  Forbidden: 403;
  ContentNotFound: 404;
  MethodNotAllowed: 405;
  TooManyRequests: 429;
  InternalServerError: 500;
  BadGateway: 502;
  ServiceUnavailable: 503;
  GatewayTimeout: 504;
}
