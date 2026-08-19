"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, ImageIcon, Star } from "lucide-react";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_MB = 10;
const isVideoUrl = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", avif: "image/avif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
};

interface Props {
  bucket: "products" | "catalog" | "gallery";
  folder?: string;
  /** Single image mode */
  value?: string | null;
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  /** Multi image mode */
  images?: string[];
  onImagesChange?: (urls: string[]) => void;
  className?: string;
  /** Allow video files (mp4/webm/mov) alongside images — used for the category atmosphere hero */
  allowVideo?: boolean;
  /** Override the default 10MB cap — videos need more room */
  maxMB?: number;
}

export default function ImageUpload({
  bucket, folder = "", value, onUpload, onRemove,
  images, onImagesChange, className = "",
  allowVideo = false, maxMB = MAX_MB,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isMulti = Array.isArray(images);
  const allowed = allowVideo ? [...ALLOWED_IMAGE, ...ALLOWED_VIDEO] : ALLOWED_IMAGE;

  async function upload(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const extMime = EXT_MIME[ext];
    // Some browsers/OSes report an empty or unreliable file.type for certain video containers
    // (e.g. .mov on Windows) — fall back to trusting a recognized file extension.
    const isAllowed = allowed.includes(file.type) || (extMime && allowed.includes(extMime));
    if (!isAllowed) {
      setError(allowVideo ? "פורמט לא נתמך (JPG/PNG/WEBP/GIF/MP4/WEBM/MOV)" : "פורמט לא נתמך (JPG/PNG/WEBP/GIF)");
      return null;
    }
    if (file.size > maxMB * 1024 * 1024) { setError(`מקסימום ${maxMB}MB`); return null; }

    const path = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext || "jpg"}`;
    const supabase = createClient();

    const { error: err } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "31536000", contentType: extMime || file.type || undefined });
    if (err) { setError(err.message); return null; }

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);

    if (isMulti) {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await upload(file);
        if (url) urls.push(url);
      }
      if (urls.length) onImagesChange?.([...(images ?? []), ...urls]);
    } else {
      const url = await upload(files[0]);
      if (url) onUpload?.(url);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Single image preview */}
      {!isMulti && value && (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-stone-200 group bg-stone-100">
          {isVideoUrl(value) ? (
            <video src={value} muted loop controls className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="" className="w-full h-full object-cover" />
          )}
          {onRemove && (
            <button type="button" onClick={onRemove}
              className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Multi images grid */}
      {isMulti && images!.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images!.map((url, i) => (
            <div
              key={i}
              className={`relative w-20 h-20 rounded-lg overflow-hidden group bg-stone-100 transition-all ${
                i === 0 ? "border-2 border-amber-400 shadow-sm" : "border border-stone-200"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              {/* Star: filled gold on primary, outline on hover for others */}
              <button
                type="button"
                title={i === 0 ? "תמונה ראשית" : "הגדר כראשית"}
                onClick={() => {
                  if (i === 0) return;
                  onImagesChange?.([url, ...images!.filter((_, idx) => idx !== i)]);
                }}
                className={`absolute bottom-1 left-1 p-0.5 rounded-full transition-all ${
                  i === 0
                    ? "text-amber-400 drop-shadow"
                    : "text-white/70 opacity-0 group-hover:opacity-100 hover:text-amber-300"
                }`}
              >
                <Star size={13} fill={i === 0 ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => onImagesChange?.(images!.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={allowed.join(",")}
          multiple={isMulti}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm px-4 py-2.5 border border-dashed border-stone-300 rounded-xl text-stone-600 hover:border-stone-500 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {uploading
            ? <Loader2 size={15} className="animate-spin" />
            : <Upload size={15} />}
          {uploading ? "מעלה..." : isMulti ? "העלה תמונות" : "העלה תמונה"}
        </button>

        {!isMulti && !value && (
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <ImageIcon size={12} /> {allowVideo ? "JPG / PNG / WEBP / MP4 / WEBM" : "JPG / PNG / WEBP"} · עד {maxMB}MB
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
