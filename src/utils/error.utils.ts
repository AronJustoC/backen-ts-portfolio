/**
 * Clase base para errores de aplicacion manejables.
 * @param statusCode - Codigo de esado HTTP.
 * @param message - Mensaje de error para el cliente.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/**
 * Error para recursos no encontrados (HTTP 404).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

/**
 * Error de credenciales invalidas o falta de autorizacion (HTTP 401).
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'credenciales invalidas') {
    super(401, message);
  }
}
