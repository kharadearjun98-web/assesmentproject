import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from "react";
const appCss = "/assets/styles-CzG-Q5ii.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$1 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$1.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dark Phoenix — LUNARTECH Clipper" },
      {
        name: "description",
        content: "Upload a video or paste a URL and burn a LUNARTECH watermark into it using the Dark Phoenix processing backend."
      },
      { property: "og:title", content: "Dark Phoenix — LUNARTECH Clipper" },
      {
        property: "og:description",
        content: "Upload a video or paste a URL and burn a LUNARTECH watermark into it using the Dark Phoenix processing backend."
      }
    ]
  }),
  component: DarkPhoenixDashboard
});
const DEFAULT_BACKEND = "http://localhost:4000";
function DarkPhoenixDashboard() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND);
  const [health, setHealth] = useState("unknown");
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [jobs, setJobs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`${backendUrl}/health`).then((r) => r.json()).then(() => !cancelled && setHealth("online")).catch(() => !cancelled && setHealth("offline"));
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
            return await r.json();
          } catch {
            return j;
          }
        })
      );
      setJobs(updated);
    }, 1500);
    return () => clearInterval(t);
  }, [jobs, backendUrl]);
  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      let r;
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
          body: JSON.stringify({ url: u })
        });
      }
      if (!r.ok) throw new Error(`Backend responded ${r.status}`);
      const job = await r.json();
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
  const canSubmit = health === "online" && !submitting && (mode === "file" && !!file || mode === "url" && videoUrl.trim().length > 0);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background text-foreground", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-6 py-12", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-10 flex items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-muted-foreground", children: "LUNARTECH · Dark Phoenix" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-4xl font-bold tracking-tight", children: "Watermark Clipper" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 max-w-xl text-sm text-muted-foreground", children: [
          "Upload a video ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "or" }),
          " paste a URL. The Node backend burns a ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "LUNARTECH" }),
          " ",
          "watermark into every frame with ffmpeg."
        ] })
      ] }),
      /* @__PURE__ */ jsx(HealthPill, { status: health })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "1. Choose a source" }),
        /* @__PURE__ */ jsxs("div", { className: "inline-flex rounded-md border border-border bg-muted p-1 text-xs", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMode("file"),
              className: `rounded px-3 py-1 font-medium transition ${mode === "file" ? "bg-background shadow" : "text-muted-foreground"}`,
              children: "Upload file"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMode("url"),
              className: `rounded px-3 py-1 font-medium transition ${mode === "url" ? "bg-background shadow" : "text-muted-foreground"}`,
              children: "From URL"
            }
          )
        ] })
      ] }),
      mode === "file" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "MP4 / MOV / WebM up to 500 MB. Watermark is rendered server-side." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "video/*",
              onChange: (e) => setFile(e.target.files?.[0] ?? null),
              className: "block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: submit,
              disabled: !canSubmit,
              className: "inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
              children: submitting ? "Uploading…" : "Process video"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
          "Paste a YouTube link or a direct video URL. The backend uses",
          " ",
          /* @__PURE__ */ jsx("code", { className: "font-mono", children: "yt-dlp" }),
          " to download, then watermarks."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-[1fr_auto]", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              placeholder: "https://www.youtube.com/watch?v=…",
              value: videoUrl,
              onChange: (e) => setVideoUrl(e.target.value),
              className: "block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: submit,
              disabled: !canSubmit,
              className: "inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
              children: submitting ? "Submitting…" : "Fetch & watermark"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Backend URL" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: backendUrl,
            onChange: (e) => setBackendUrl(e.target.value),
            className: "mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
      health === "offline" && /* @__PURE__ */ jsxs("p", { className: "mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm", children: [
        "Backend offline. Start it with",
        " ",
        /* @__PURE__ */ jsx("code", { className: "font-mono", children: "cd backend && npm install && npm start" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "2. Jobs" }),
      jobs.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "No jobs yet." }) : /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-3", children: jobs.map((j) => /* @__PURE__ */ jsx(JobRow, { job: j, backendUrl }, j.id)) })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "mt-16 border-t border-border pt-6 text-xs text-muted-foreground", children: [
      "Frontend: React + TanStack Start · Backend: Node + Express + ffmpeg + yt-dlp · Watermark: ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "LUNARTECH" }),
      " burned via ffmpeg",
      " ",
      /* @__PURE__ */ jsx("code", { children: "drawtext" }),
      "."
    ] })
  ] }) });
}
function HealthPill({ status }) {
  const map = {
    unknown: { label: "Checking backend…", dot: "bg-muted-foreground" },
    online: { label: "Backend online", dot: "bg-emerald-500" },
    offline: { label: "Backend offline", dot: "bg-destructive" }
  };
  const cfg = map[status];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs", children: [
    /* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full ${cfg.dot}` }),
    cfg.label
  ] });
}
function JobRow({ job, backendUrl }) {
  const statusColor = job.status === "completed" ? "text-emerald-600" : job.status === "failed" ? "text-destructive" : "text-amber-600";
  const stageLabel = job.status === "processing" && job.stage === "downloading" ? "Downloading" : job.status === "processing" ? "Watermarking" : job.status;
  return /* @__PURE__ */ jsxs("li", { className: "rounded-lg border border-border bg-card p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("p", { className: "truncate font-medium", children: [
          job.originalName,
          job.source === "url" && /* @__PURE__ */ jsx("span", { className: "ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: "URL" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: [
          job.sourceUrl ? job.sourceUrl : `${formatBytes(job.sizeBytes)}`,
          " ·",
          " ",
          new Date(job.createdAt).toLocaleTimeString()
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: `text-xs font-semibold uppercase tracking-wider ${statusColor}`, children: stageLabel })
    ] }),
    job.status === "processing" && /* @__PURE__ */ jsx("div", { className: "mt-3 h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "h-full bg-primary transition-all",
        style: { width: `${job.progress}%` }
      }
    ) }),
    job.status === "completed" && job.downloadUrl && /* @__PURE__ */ jsxs(
      "a",
      {
        href: `${backendUrl}${job.downloadUrl}`,
        className: "mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
        children: [
          "↓ Download watermarked video",
          job.outputSizeBytes ? ` (${formatBytes(job.outputSizeBytes)})` : ""
        ]
      }
    ),
    job.status === "failed" && job.error && /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-destructive", children: job.error })
  ] });
}
function formatBytes(n) {
  if (!n) return "0 B";
  const k = 1024;
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(k)));
  return `${(n / Math.pow(k, i)).toFixed(1)} ${u[i]}`;
}
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
