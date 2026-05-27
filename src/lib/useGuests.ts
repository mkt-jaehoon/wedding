"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminPatch, Guest, GuestInput, PublicGuest } from "./types";
import { guestStore, UnauthorizedError } from "./store";

// 공개 현황(/status)
export function usePublicGuests() {
  const [guests, setGuests] = useState<PublicGuest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const g = await guestStore.listPublic();
    setGuests(g);
  }, []);

  useEffect(() => {
    let active = true;
    guestStore
      .seedDemoIfEmpty()
      .then(() => guestStore.listPublic())
      .then((g) => active && (setGuests(g), setLoading(false)))
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { guests, loading, refresh };
}

// 신청(/apply)
export function createGuest(input: GuestInput) {
  return guestStore.create(input);
}

// 관리자(/admin) — 로그인(세션) 후 사용
export function useAdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const g = await guestStore.listAdmin();
      setGuests(g);
      setError(null);
    } catch (e) {
      setError(e instanceof UnauthorizedError ? "unauthorized" : (e as Error).message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    guestStore
      .listAdmin()
      .then((g) => active && (setGuests(g), setError(null), setLoading(false)))
      .catch(
        (e) =>
          active &&
          (setError(e instanceof UnauthorizedError ? "unauthorized" : e.message),
          setLoading(false)),
      );
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    async (id: string, patch: AdminPatch) => {
      await guestStore.updateAdmin(id, patch);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await guestStore.removeAdmin(id);
      await refresh();
    },
    [refresh],
  );

  return { guests, loading, error, update, remove, refresh };
}
