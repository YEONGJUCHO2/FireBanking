import { randomUUID } from "crypto";

export function createInviteToken() {
  return randomUUID();
}
