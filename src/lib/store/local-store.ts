import type { AdminPatch, Guest, GuestInput, PublicGuest } from "../types";
import { maskName } from "../format";
import { coarsenStatus } from "../labels";
import { seedGuests } from "../seed";
import { checkPasscode, isDemoAuthed, setDemoAuthed } from "../auth";
import { UnauthorizedError, type GuestStore } from "./types";

const KEY = "wedding.guests.v1";

function read(): Guest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Guest[]) : [];
  } catch {
    return [];
  }
}

function write(guests: Guest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(guests));
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPublic(g: Guest): PublicGuest {
  return {
    id: g.id,
    displayName: g.displayName,
    outbound: {
      trainType: g.outbound.trainType,
      from: g.outbound.from,
      to: g.outbound.to,
      date: g.outbound.date,
      timeBand: g.outbound.timeBand,
    },
    hasReturn: g.hasReturn,
    inbound:
      g.hasReturn && g.inbound
        ? {
            trainType: g.inbound.trainType,
            from: g.inbound.from,
            to: g.inbound.to,
            date: g.inbound.date,
            timeBand: g.inbound.timeBand,
          }
        : undefined,
    publicStatus: coarsenStatus(g.status),
    createdAt: g.createdAt,
  };
}

function ensureAuthed() {
  if (!isDemoAuthed()) throw new UnauthorizedError();
}

// 데모 스토어: Supabase 미설정 시 폴백. 데이터는 브라우저 localStorage.
export const demoGuestStore: GuestStore = {
  async listPublic() {
    return read()
      .filter((g) => g.publicVisible && g.status !== "CANCELLED")
      .sort((a, b) => a.outbound.date.localeCompare(b.outbound.date))
      .map(toPublic);
  },

  async create(input: GuestInput) {
    const now = new Date().toISOString();
    const guest: Guest = {
      id: newId(),
      name: input.name.trim(),
      displayName: maskName(input.name),
      phone: input.phone?.trim() || undefined,
      groupName: input.groupName?.trim() || undefined,
      partySize: input.partySize,
      outbound: input.outbound,
      hasReturn: input.hasReturn,
      inbound: input.hasReturn ? input.inbound : undefined,
      status: "REQUESTED",
      memo: input.memo?.trim() || undefined,
      publicVisible: input.publicVisible,
      privacyAgreed: input.privacyAgreed,
      createdAt: now,
      updatedAt: now,
    };
    write([...read(), guest]);
  },

  async adminLogin(passcode: string) {
    const ok = checkPasscode(passcode);
    if (ok) setDemoAuthed(true);
    return ok;
  },

  async adminLogout() {
    setDemoAuthed(false);
  },

  async adminIsAuthed() {
    return isDemoAuthed();
  },

  async listAdmin() {
    ensureAuthed();
    return read().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async updateAdmin(id: string, patch: AdminPatch) {
    ensureAuthed();
    const guests = read();
    const idx = guests.findIndex((g) => g.id === id);
    if (idx === -1) return;
    guests[idx] = {
      ...guests[idx],
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.publicVisible !== undefined
        ? { publicVisible: patch.publicVisible }
        : {}),
      ...(patch.memo !== undefined ? { memo: patch.memo || undefined } : {}),
      updatedAt: new Date().toISOString(),
    };
    write(guests);
  },

  async removeAdmin(id: string) {
    ensureAuthed();
    write(read().filter((g) => g.id !== id));
  },

  async seedDemoIfEmpty() {
    if (typeof window === "undefined") return;
    if (read().length === 0) write(seedGuests());
  },
};
