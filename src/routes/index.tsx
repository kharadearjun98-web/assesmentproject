import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Phoenix — LUNARTECH Clipper" },
      {
        name: "description",
        content:
          "Upload a video or paste a URL and burn a LUNARTECH watermark into it using the Dark Phoenix processing backend.",
      },
      { property: "og:title", content: "Dark Phoenix — LUNARTECH Clipper" },
      {
        property: "og:description",
        content:
          "Upload a video or paste a URL and burn a LUNARTECH watermark into it using the Dark Phoenix processing backend.",
      },
    ],
  }),
  component: DarkPhoenixDashboard,
});

const DEFAULT_BACKEND = "http://localhost:4000";

type Job = {
  id: string;
  status: "processing" | "completed" | "failed";
  stage?: "downloading" | "watermarking" | "done";
  source?: "upload" | "url";
  sourceUrl?: string;
  progress: number;
  originalName: string;
  sizeBytes: number;
  outputSizeBytes?: number;
  createdAt: string;
  completedAt?: string;
  error: string | null;
  downloadUrl: string | null;
};

type Mode = "file" | "url";

function DarkPhoenixDashboard() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND);
  const [health, setHealth] = useState<"unknown" | "online" | "offline">("unknown");
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${backendUrl}/health`)
      .then((r) => r.json())
      .then(() => !cancelled && setHealth("online"))
      .catch(() => !cancelled && setHealth("offline"));
    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  useEffect(() => {
    if (!jobs.some((j) => j.status === "processing")) return;
    const t = setInterval(async () => {
      const updated = await Promise.all(
        jobs.map(async (j) => {
          if (j.status !== "processing") return j;
          try {
            const r = await fetch(`${backendUrl}/api/jobs/${j.id}`);
            if (!r.ok) return j;
            return (await r.json()) as Job;
          } catch {
            return j;
          }
        }),
      );
      setJobs(updated);
    }, 1500);
    return () => clearInterval(t);
  }, [jobs, backendUrl]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      let r: Response;
      if (mode === "file") {
        if (!file) throw new Error("Pick a video file first");
        const fd = new FormData();
        fd.append("video", file);
        r = await fetch(`${backendUrl}/api/process`, { method: "POST", body: fd });
      } else {
        const u = videoUrl.trim();
        if (!/^https?:\/\//i.test(u)) throw new Error("Enter a valid http(s) URL");
        r = await fetch(`${backendUrl}/api/process-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: u }),
        });
      }
      if (!r.ok) throw new Error(`Backend responded ${r.status}`);
      const job = (await r.json()) as Job;
      setJobs((prev) => [job, ...prev]);
      setFile(null);
      setVideoUrl("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [mode, file, videoUrl, backendUrl]);

  const canSubmit =
    health === "online" &&
    !submitting &&
    ((mode === "file" && !!file) || (mode === "url" && videoUrl.trim().length > 0));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              LUNARTECH · Dark Phoenix
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Watermark Clipper</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Upload a video <span className="font-semibold">or</span> paste a URL. The Node
              backend burns a <span className="font-semibold text-foreground">LUNARTECH</span>{" "}
              watermark into every frame with ffmpeg.
            </p>
          </div>
          <HealthPill status={health} />
        </header>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">1. Choose a source</h2>
            <div className="inline-flex rounded-md border border-border bg-muted p-1 text-xs">
              <button
                onClick={() => setMode("file")}
                className={`rounded px-3 py-1 font-medium transition ${
                  mode === "file" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                Upload file
              </button>
              <button
                onClick={() => setMode("url")}
                className={`rounded px-3 py-1 font-medium transition ${
                  mode === "url" ? "bg-background shadow" : "text-muted-foreground"
                }`}
              >
                From URL
              </button>
            </div>
          </div>

          {mode === "file" ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                MP4 / MOV / WebM up to 500 MB. Watermark is rendered server-side.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                />
                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Uploading…" : "Process video"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Paste a YouTube link or a direct video URL. The backend uses{" "}
                <code className="font-mono">yt-dlp</code> to download, then watermarks.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Fetch & watermark"}
                </button>
              </div>
            </>
          )}

          <div className="mt-4">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Backend URL
            </label>
            <input
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs"
            />
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {health === "offline" && (
            <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              Backend offline. Start it with{" "}
              <code className="font-mono">cd backend && npm install && npm start</code>.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">2. Jobs</h2>
          {jobs.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {jobs.map((j) => (
                <JobRow key={j.id} job={j} backendUrl={backendUrl} />
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          Frontend: React + TanStack Start · Backend: Node + Express + ffmpeg + yt-dlp ·
          Watermark: <span className="font-semibold">LUNARTECH</span> burned via ffmpeg{" "}
          <code>drawtext</code>.
        </footer>
      </div>
    </div>
  );
}

function HealthPill({ status }: { status: "unknown" | "online" | "offline" }) {
  const map = {
    unknown: { label: "Checking backend…", dot: "bg-muted-foreground" },
    online: { label: "Backend online", dot: "bg-emerald-500" },
    offline: { label: "Backend offline", dot: "bg-destructive" },
  } as const;
  const cfg = map[status];
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </div>
  );
}

function JobRow({ job, backendUrl }: { job: Job; backendUrl: string }) {
  const statusColor =
    job.status === "completed"
      ? "text-emerald-600"
      : job.status === "failed"
        ? "text-destructive"
        : "text-amber-600";
  const stageLabel =
    job.status === "processing" && job.stage === "downloading"
      ? "Downloading"
      : job.status === "processing"
        ? "Watermarking"
        : job.status;
  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {job.originalName}
            {job.source === "url" && (
              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                URL
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {job.sourceUrl ? job.sourceUrl : `${formatBytes(job.sizeBytes)}`} ·{" "}
            {new Date(job.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
          {stageLabel}
        </span>
      </div>

      {job.status === "processing" && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {job.status === "completed" && job.downloadUrl && (
        <a
          href={`${backendUrl}${job.downloadUrl}`}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          ↓ Download watermarked video
          {job.outputSizeBytes ? ` (${formatBytes(job.outputSizeBytes)})` : ""}
        </a>
      )}

      {job.status === "failed" && job.error && (
        <p className="mt-3 text-xs text-destructive">{job.error}</p>
      )}
    </li>
  );
}

function formatBytes(n: number) {
  if (!n) return "0 B";
  const k = 1024;
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(k)));
  return `${(n / Math.pow(k, i)).toFixed(1)} ${u[i]}`;
}
