import Link from "next/link";
import { AuthNoticeMessage } from "./auth-notice";
import { outlineButtonClassName } from "./styles";

// An emailed link that is missing its token, already used, or expired, with the way to get a new one.
export function LinkProblem({
  message,
  retryHref,
  retryLabel,
}: {
  message: string;
  retryHref: string;
  retryLabel: string;
}) {
  return (
    <div className="flex flex-col gap-[35px]">
      <AuthNoticeMessage notice={{ message }} />
      <Link className={`${outlineButtonClassName} w-full`} href={retryHref}>
        {retryLabel}
      </Link>
    </div>
  );
}
