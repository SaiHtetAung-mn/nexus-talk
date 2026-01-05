export type JwtPayload = {
  userId: string;
  iat?: number;
  exp?: number;
};
