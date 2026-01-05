export class TokenExpiredException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredException';
  }
}
