"use client";
import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDispatch ,useSelector} from "react-redux";
import { setToken ,setUser} from "@/state";
import { initialStateType } from "../../types";
export default function Syncer() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const token = useSelector((state:initialStateType)=>state.token);
  const fetchUser = useCallback(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/get`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          console.error(data.message);
          return;
        }
        dispatch(setUser(data.user));
      } catch (error) {
        if (error instanceof Error) console.error(error.message);
        else console.error("failed to fetch");
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
