// ============================================================================
// FileUploadCard — drag & drop image uploader with previews and removal.
// ============================================================================

// Imports
import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";

// Interfaces
export interface UploadedFile {
  id: string;
  name: string;
  /** Object URL used for the preview thumbnail. */
  url: string;
  /** Raw File object used for S3 upload. */
  file: File;
}

interface FileUploadCardProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Optional validation error message. */
  error?: string;
}

// Component
export function FileUploadCard({ files, onChange, error }: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Convert a FileList into preview objects and append them.
  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const next: UploadedFile[] = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: f.name,
          url: URL.createObjectURL(f),
          file: f,
        }));
      onChange([...files, ...next]);
    },
    [files, onChange]
  );

  // Drag handlers
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // Remove a single uploaded file.
  const removeFile = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.url);
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange]
  );

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm text-secondary-foreground">Photos</label>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/10"
            : error
            ? "border-red-500/50 bg-background/40"
            : "border-border bg-background/40 hover:border-primary/40",
        ].join(" ")}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-input text-primary">
          <UploadCloud size={22} />
        </span>
        <p className="text-sm text-secondary-foreground">
          Drag &amp; drop photos here, or{" "}
          <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB · multiple allowed</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Field error */}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}

      {/* Previews */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-popover"
            >
              <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                aria-label={`Remove ${file.name}`}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty hint icon row when nothing uploaded */}
      {files.length === 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImageIcon size={13} /> No photos added yet.
        </p>
      )}
    </div>
  );
}
