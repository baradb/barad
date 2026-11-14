/**
 * A quiet idle backdrop behind everything: a faint dot grid plus a few big, soft
 * periwinkle blobs that drift slowly. Pure CSS, pointer-events-none, sits at -z-20
 * (behind the cursor ASCII canvas at -z-10). Motion stops under reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* Drifting soft blobs. Large, low-opacity, blurred; they wander on long loops. */}
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <div className="ambient-blob ambient-blob-3" />
      {/* Faint dot grid on top of the blobs, tying it to the ascii/pixel motif. */}
      <div className="ambient-dots absolute inset-0" />
    </div>
  );
}
