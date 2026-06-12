import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialStateType, UserType } from "../types";

const initialState: initialStateType = {
  user: null,
  token: "",
  contributions: [],
  balance: 0,
  otp: null,
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
    setBalance: (state: typeof initialState, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
  },
});

export const { setUser, setToken, setContributions, setBalance,setOtp } =
  appSlice.actions;
export default appSlice.reducer;
