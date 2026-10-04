"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSubject } from "@/app/(authenticated)/choose-subject/actions";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

export function AddSubjectCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mapel, setMapel] = useState("");
  const [kelas, setKelas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setOpen(false);
    setMapel("");
    setKelas("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mapel.trim()) return;

    const name = kelas.trim() ? `${mapel.trim()} ${kelas.trim()}` : mapel.trim();

    setLoading(true);
    setError("");
    try {
      const subject = await createSubject({ name });
      router.push(`/${subject.slug}/dashboard`);
    } catch {
      setError("Gagal membuat kelas. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[#c5c6cd] bg-white p-3 shadow-[0_4px_4px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_10px_24px_-8px_rgba(8,90,192,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#085ac0]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="grid size-16 place-items-center rounded-full bg-[#d8e2ff]">
          <PlusIcon className="size-5 text-[#085ac0]" />
        </div>
        <span className="text-base font-semibold leading-7 text-[#45474c]">Buat Kelas Baru</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-semibold text-[#091426]">Tambah Kelas Baru</h2>
            <p className="mb-5 text-sm text-[#45474c]">
              Masukkan mata pelajaran dan kelas yang ingin dipantau.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#091426]" htmlFor="mapel">
                  Mata Pelajaran
                </label>
                <Input
                  id="mapel"
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Matematika"
                  required
                  value={mapel}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#091426]" htmlFor="kelas">
                  Kelas
                </label>
                <Input
                  id="kelas"
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="X MIPA 1"
                  value={kelas}
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <Button onClick={handleClose} type="button" variant="outline">
                  Batal
                </Button>
                <Button disabled={loading || !mapel.trim()} type="submit">
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
