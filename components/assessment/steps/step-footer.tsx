import { primaryButtonClassName } from "@/components/subject-select/form-field";
import type { AssessmentFormState } from "@/lib/actions/assessments";
import { FormAlert } from "../form-controls";

// Errors not tied to a field, the "saved" notice of the last step, and the submit button.
export function StepFooter({
  state,
  pending,
  locked,
  last = false,
}: {
  state: AssessmentFormState;
  pending: boolean;
  locked: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {state?.status === "error" && state.message && <FormAlert>{state.message}</FormAlert>}
      {state?.status === "saved" && <FormAlert tone="success">Perubahan tersimpan.</FormAlert>}
      {!locked && (
        <div className="flex justify-end">
          <button className={primaryButtonClassName} disabled={pending} type="submit">
            {pending ? "Menyimpan..." : last ? "Simpan" : "Simpan & Lanjut"}
          </button>
        </div>
      )}
    </div>
  );
}
