"use client";

import Image from "next/image";
import { useState } from "react";
import { EyeIcon } from "@/components/ui/icons";
import { TextField, type TextFieldProps } from "./text-field";

export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      trailing={
        <button
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={visible}
          className="grid size-6 shrink-0 place-items-center rounded text-black focus-visible:outline-2 focus-visible:outline-[#0058be]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeIcon className="size-6" />
          ) : (
            <Image alt="" height={24} src="/auth/eye-off.svg" width={24} />
          )}
        </button>
      }
      type={visible ? "text" : "password"}
    />
  );
}
