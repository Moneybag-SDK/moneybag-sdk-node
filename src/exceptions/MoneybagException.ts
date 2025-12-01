export class MoneybagException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneybagException';
    Object.setPrototypeOf(this, MoneybagException.prototype);
  }
}

export class AuthenticationException extends MoneybagException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationException';
    Object.setPrototypeOf(this, AuthenticationException.prototype);
  }
}

export class ValidationException extends MoneybagException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

export class ApiException extends MoneybagException {
  public readonly statusCode: number;
  public readonly responseBody: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

export class NetworkException extends MoneybagException {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'NetworkException';
    this.code = code;
    Object.setPrototypeOf(this, NetworkException.prototype);
  }
}