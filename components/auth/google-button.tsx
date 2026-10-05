import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { AuthRole } from "@/lib/auth/roles";
import { primaryButtonClassName } from "./styles";

// A plain <a>, not <Link>: /auth/google is a route handler that redirects to Google and must not be prefetched.
export function GoogleButton({
  role,
  intent,
  className,
}: {
  role: AuthRole;
  intent: "login" | "register";
  className?: string;
}) {
  return (
    <a
      className={cn(primaryButtonClassName, "h-[54px]", className)}
      href={`/auth/google?role=${role}&intent=${intent}`}
    >
      <Image alt="" className="h-[14px] w-[15px]" height={14} src="/auth/google.svg" width={15} />
      Masuk Dengan Google
    </a>
  );
}
