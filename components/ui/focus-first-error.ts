// UAT baris 196: after a save shows errors, scroll to the first field marked red and focus it, so a missing field
// further up or down the page is not overlooked. Call it right after setting the errors; it waits for React to draw
// them. It looks inside the open modal, otherwise the whole page. Typing afterwards does not scroll, since only a
// save calls it.
export function focusFirstError() {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const root: ParentNode = document.querySelector("dialog[open]") ?? document;
      const target =
        root.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]') ?? root.querySelector<HTMLElement>('[role="alert"]');
      if (!target) return;
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      if (target.matches("input, select, textarea, button")) target.focus({ preventScroll: true });
    }),
  );
}
