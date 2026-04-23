export class CustomError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = "CustomError";
    this.code = code;
  }

  static validationError(message = "Validation failed") {
    return new CustomError(message, 400);
  }

  static badRequestError(message = "Bad request") {
    return new CustomError(message, 400);
  }

  static notFoundError(message = "Resource not found") {
    return new CustomError(message, 404);
  }

  static authFailedError(message = "Unauthorized access") {
    return new CustomError(message, 401);
  }

  static forbiddenError(message = "Forbidden") {
    return new CustomError(message, 403);
  }

  static partnerResponseTimeout(message = "Response is empty or no response") {
    return new CustomError(message, 504);
  }

  static partnerResponseError(message = "Partner response error", code = 400) {
    return new CustomError(message, code);
  }

  // PartnersAPI xatolarni qo‘shish
  static partnerNotFoundError(message = "Partner not found") {
    return new CustomError(message, 404);
  }

  static partnerServerError(message = "Internal server error") {
    return new CustomError(message, 500);
  }

  static partnerBadRequestError(message = "Bad request") {
    return new CustomError(message, 400);
  }
}
