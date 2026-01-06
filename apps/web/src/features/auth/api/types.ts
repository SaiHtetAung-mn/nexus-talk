export type UserPayload = {
  _id: string;
  name: string;
  email: string;
  username: string;
  provider: "local" | "google";
  providerId: string | null;
  isEmailVerified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AuthResponse = {
  user: UserPayload;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
};

export type MessageResponse = {
  message: string;
};
