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
  isVerified: boolean;
  isBankConnected: boolean;
}

export interface initialStateType {
  user: UserType | null;
  token: string | null;
  contributions: unknown[];
  totalContributedBalance: number;
  otp: {
    code: string;
    expiresAt: Date;
  } | null;
  bankDetails: bankDetails | null;
}

export interface formValuesType {
  email: string;
  name: string;
  image?: File | null;
  imageUrl?: string;
  password?: string;
  role: string;
}

export interface bankDetails {
  institutionName: string;
  accountNumber: string;
  transitNumber: string;
  institutionNumber: string;
  balance: Number;
  ownerId: string;
}
