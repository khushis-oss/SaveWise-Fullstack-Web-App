"use client";
import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/state";
import { initialStateType } from "../../types";
import { apiFetch } from "@/lib/apiClient";

export default function Syncer() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const token = useSelector((state: initialStateType) => state.token);

  const fetchUser = useCallback(async () => {
    try {
      const response = await apiFetch("/user/get", token);
      const data = await response.json();
      if (!response.ok) {
        console.error(data.message);
        return;
      }
      dispatch(setUser(data.user));
    } catch (err) {
      if (err instanceof Error && err.message !== "UNAUTHORIZED")
        console.error(err.message);
    }
  }, [token, dispatch]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backendToken = (session as any)?.backendToken as string | null | undefined;
    if (backendToken) {
      dispatch(setToken(backendToken));
    }
  }, [session, dispatch]);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return null;
}
