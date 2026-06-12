"use client";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import reducer from "@/state";

const store = configureStore({ reducer });

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
