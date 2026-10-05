import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthNotice } from "@/lib/auth/messages";
import { authRoles } from "@/lib/auth/roles";
import { textLinkClassName } from "./styles";

// An error above or inside an auth form, with a link to the right sign-in page when the role is wrong.
export function AuthNoticeMessage({ notice, children }: { notice: AuthNotice; children?: ReactNode }) {
  const wrongRole = notice.wrongRole && authRoles[notice.wrongRole];

  return (
    <div className="w-full rounded-lg bg-[#ffdad6] px-4 py-3 text-sm leading-5 text-[#93000a]" role="alert">
      <p>
        {notice.message}
        {wrongRole && (
          <>
            {" "}
            <Link className={`${textLinkClassName} font-semibold`} href={wrongRole.loginPath}>
              Masuk lewat halaman {wrongRole.label}.
            </Link>
          </>
        )}
      </p>
      {children}
    </div>
  );
}
