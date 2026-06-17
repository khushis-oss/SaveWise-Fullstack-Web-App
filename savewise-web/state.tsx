import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { bankDetails, initialStateType, UserType } from "../types";

const initialState: initialStateType = {
  user: null,
  token: "",
  contributions: [],
  totalContributedBalance: 0,
  otp: null,
  bankDetails: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (
      state: typeof initialState,
      action: PayloadAction<UserType | null>,
    ) => {
      state.user = action.payload;
    },
    setToken: (
      state: typeof initialState,
      action: PayloadAction<string | null>,
    ) => {
      state.token = action.payload;
    },
    setOtp: (
      state: typeof initialState,
      action: PayloadAction<{ code: string; expiresAt: Date } | null>,
    ) => {
      state.otp = action.payload;
    },
    setContributions: (
      state: typeof initialState,
      action: PayloadAction<unknown[]>,
    ) => {
      state.contributions = action.payload;
    },
    setTotalContributedBalance: (state: typeof initialState, action: PayloadAction<number>) => {
      state.totalContributedBalance = action.payload;
    },
    setBankDetails: (
      state: typeof initialState,
      action: PayloadAction<bankDetails>,
    ) => {
      state.bankDetails = action.payload;
    },
  },
});

export const {
  setUser,
  setToken,
  setContributions,
  setTotalContributedBalance,
  setOtp,
  setBankDetails,
} = appSlice.actions;
export default appSlice.reducer;
