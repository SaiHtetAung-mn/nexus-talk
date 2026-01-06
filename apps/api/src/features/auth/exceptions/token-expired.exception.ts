export class TokenExpiredException extends Error {
  constructor(message?: string) {
    super(message ?? 'Token has expired');
    this.name = 'TokenExpiredException';
  }
}
