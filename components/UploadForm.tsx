"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { uploadTrack, type UploadState } from "@/lib/actions";
import { formatTime } from "@/lib/format";

const MAX_BYTES = 30 * 1024 * 1024;
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"];

type Details = {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
};
type Cover = { file: File; url: string };

const EMPTY: Details = {
  title: "",
  artist: "",
  album: "",
  genre: "",
  year: "",
};
const initialState: UploadState = {};

export default function UploadForm() {
  const [state, dispatch, isPending] = useActionState(
    uploadTrack,
    initialState
  );
  const [, startTransition] = useTransition();

  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<Cover | null>(null);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [duration, setDuration] = useState(0);
  const [problem, setProblem] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Create the preview URL at the moment the cover changes.
  function changeCover(file: File | null) {
    setCover(file ? { file, url: URL.createObjectURL(file) } : null);
  }

  // Free the previous preview URL whenever the cover changes, and when leaving the page.
  useEffect(() => {
    if (!cover) return;
    return () => URL.revokeObjectURL(cover.url);
  }, [cover]);

  async function pickAudio(file: File | undefined) {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!AUDIO_EXTENSIONS.includes(ext))
      return setProblem("Use an MP3, WAV, FLAC, OGG, M4A or AAC file.");
    if (file.size > MAX_BYTES) return setProblem("That file is over 30 MB.");

    setProblem("");
    setAudio(file);
    changeCover(null);
    setIsReading(true);
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");

    try {
      // Read the tags stored inside the file (the library loads only when needed).
      const { parseBlob } = await import("music-metadata");
      const { common, format } = await parseBlob(file);

      setDetails({
        title: common.title ?? nameWithoutExt,
        artist: common.artist ?? "",
        album: common.album ?? "",
        genre: common.genre?.[0] ?? "",
        year: common.year ? String(common.year) : "",
      });
      setDuration(format.duration ?? 0);

      const picture = common.picture?.[0];
      if (picture) {
        const pictureExt = picture.format.split("/")[1] ?? "jpg";
        changeCover(
          new File([new Uint8Array(picture.data)], `cover.${pictureExt}`, {
            type: picture.format,
          })
        );
      }
    } catch {
      // No readable tags: fall back to the file name.
      setDetails({ ...EMPTY, title: nameWithoutExt });
    } finally {
      setIsReading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!audio) return setProblem("Choose an audio file.");

    const formData = new FormData();
    formData.set("audio", audio);
    if (cover) formData.set("cover", cover.file);
    formData.set("duration", String(duration));
    for (const [key, value] of Object.entries(details))
      formData.set(key, value);

    // Calling the action ourselves (not via the form's action prop) means React won't clear the form.
    startTransition(() => dispatch(formData));
  }

  const bind = (key: keyof Details) => ({
    value: details[key],
    onChange: (value: string) => setDetails((d) => ({ ...d, [key]: value })),
  });

  const message = problem || state.error;

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
      {/* Drop zone: click to choose, or drag a file onto it */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          pickAudio(e.dataTransfer.files[0]);
        }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-soft"
            : "border-line bg-raised hover:border-accent"
        }`}
      >
        <Upload size={32} className="text-accent" />
        <span className="text-heading-s">
          {audio ? audio.name : "Drop a song here, or click to choose"}
        </span>
        <span className="text-body-s text-faint">
          {isReading
            ? "Reading tags…"
            : audio
              ? formatTime(duration)
              : "MP3, WAV, FLAC, OGG, M4A or AAC · up to 30 MB"}
        </span>
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a,.aac"
          className="sr-only"
          onChange={(e) => pickAudio(e.target.files?.[0])}
        />
      </label>

      <div className="flex items-end gap-5">
        {/* Cover: taken from the file if it has one, or chosen by hand */}
        <label className="group relative grid size-28 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm bg-sunken text-faint">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of a chosen file
            <img
              src={cover.url}
              alt="Cover preview"
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon size={28} strokeWidth={1.5} />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-deck/70 py-1 text-center text-body-s text-on-deck opacity-0 transition-opacity group-hover:opacity-100">
            {cover ? "Change" : "Add cover"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => changeCover(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-1 flex-col gap-4">
          <Field label="Title" required {...bind("title")} />
          <Field label="Artist" required {...bind("artist")} />
        </div>
      </div>

      <Field
        label="Album"
        placeholder="Leave empty to add it as a single"
        {...bind("album")}
      />
      <div className="grid grid-cols-[1fr_120px] gap-4">
        <Field label="Genre" placeholder="Metalcore" {...bind("genre")} />
        <Field
          label="Year"
          placeholder="2024"
          inputMode="numeric"
          {...bind("year")}
        />
      </div>

      {message && (
        <p role="alert" className="text-body-m text-oxblood">
          {message}
        </p>
      )}

      <button
        disabled={!audio || isReading || isPending}
        className="self-start rounded-full bg-accent px-6 py-3 text-heading-s text-on-accent disabled:opacity-50"
      >
        {isPending ? "Uploading…" : "Add to crate"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: "numeric";
};

function Field({ label, onChange, ...rest }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-label uppercase text-faint">{label}</span>
      <input
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="h-12 min-w-0 rounded-xl bg-sunken px-4 text-body-m outline-none placeholder:text-faint focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}
