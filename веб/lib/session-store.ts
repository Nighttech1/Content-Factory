"use client";

import { create } from "zustand";

export type SessionRole = "OWNER" | "ADMIN";

type SessionState = {
  role: SessionRole;
  setRole: (role: SessionRole) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  role: "OWNER",
  setRole: (role) => set({ role }),
}));
