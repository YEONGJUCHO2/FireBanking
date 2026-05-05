import { signOut } from "@/src/features/auth/actions/signOut";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          compact
            ? "fb-focus rounded-full border border-fb-line bg-white px-3 py-2 text-xs font-bold text-fb-ink-3 shadow-card transition hover:border-fb-line-strong hover:text-fb-ink"
            : "fb-focus w-full rounded-button border border-fb-line bg-white px-4 py-3 text-sm font-bold text-fb-ink-3 shadow-card transition hover:border-fb-line-strong hover:text-fb-ink"
        }
      >
        로그아웃
      </button>
    </form>
  );
}
