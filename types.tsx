export interface UserType {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  profilePictureUrl: string;
  contributions: [];
  role: string;
  otp: {
    code: String;
    expiresAt: Date;
  };
  balance: Number;
}

export interface  initialStateType {
    user: UserType | null,
    token: string | null,
    contributions: unknown[],
    balance: number,
}

export interface formValuesType {
      email: string,
      name: string,
      image?: File | null,
      imageUrl?: string,
      password?: string,
      role: string,
    }