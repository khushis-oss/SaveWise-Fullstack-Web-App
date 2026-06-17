"use client";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useState } from "react";
import reducer from "@/state";

// const tokenPersistenceMiddleware = (_storeAPI: any) => (next: any) => (action: any) => {
//   const result = next(action);
//   if (setToken.match(action)) {
//     const token = action.payload;
//     if (token) {
//       localStorage.setItem("sw_token", token);
//     } else {
//       localStorage.removeItem("sw_token");
//     }
//   }
//   return result;
// };

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => {
    const s = configureStore({
      reducer,
      // middleware: (getDefault) => getDefault().concat(tokenPersistenceMiddleware),
    });
    // if (typeof window !== "undefined") {
    //   const savedToken = localStorage.getItem("sw_token");
    //   if (savedToken) s.dispatch(setToken(savedToken));
    // }
    return s;
  });

  return <Provider store={store}>{children}</Provider>;
}
