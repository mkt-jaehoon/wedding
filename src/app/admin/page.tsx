"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { guestStore } from "@/lib/store";

export default function AdminPage() {
  // undefined = 확인 전, false = 미로그인, true = 로그인됨
  const [authed, setAuthed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    guestStore
      .adminIsAuthed()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  if (authed === undefined) return null;

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <AdminDashboard
      onLogout={async () => {
        await guestStore.adminLogout();
        setAuthed(false);
      }}
    />
  );
}
