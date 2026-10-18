import Image from "next/image";

// The two wide ellipses behind a subject workspace (Figma New Design 22:4162, 175:32037), at their design size.
// Shared by the teacher and student workspaces.
export function WorkspaceBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
      <Image
        alt=""
        className="absolute left-1/2 top-[-850px] h-[1704px] w-[1067px] max-w-none -translate-x-1/2 -rotate-[107deg]"
        height={1704}
        src="/dashboard/bg-curve-top.svg"
        width={1067}
      />
      <Image
        alt=""
        className="absolute left-[calc(50%+380px)] top-[560px] h-[1704px] w-[1067px] max-w-none -translate-x-1/2 -scale-y-100 rotate-[107deg]"
        height={1704}
        src="/dashboard/bg-curve-bottom.svg"
        width={1067}
      />
    </div>
  );
}
