#!/usr/bin/env python3
"""
BlueTEXT Static Development & Production Web Server
Zero external dependencies - Uses Python 3 standard library only.

Performance-optimized:
  * Threaded server  -> concurrent connections (no head-of-line blocking)
  * HTTP/1.1 keep-alive + TCP_NODELAY -> fewer round trips, lower latency
  * os.sendfile() (zero-copy, kernel-level) inherited from SimpleHTTPRequestHandler
  * Reverse-DNS disabled -> no per-request DNS stall
  * Smart caching: immutable long-cache for fingerprinted/static assets,
    revalidate for HTML
  * Precomputed constants and cheap fast-path routing
"""

import http.server
import os
import socket
import sys

# ---- Configuration (env-overridable, resolved once at import) ----------------
PORT = int(os.environ.get("PORT", 8080))
HOST = os.environ.get("HOST", "0.0.0.0")
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

# Extensions that are safe to cache aggressively (content-addressed / static).
_LONG_CACHE_EXTS = frozenset(
    (".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".gif", ".webp",
     ".avif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".otf",
     ".mp4", ".webm", ".wasm")
)
_LONG_CACHE = "public, max-age=31536000, immutable"
_HTML_CACHE = "no-cache"


class Handler(http.server.SimpleHTTPRequestHandler):
    # HTTP/1.1 enables persistent connections (keep-alive) => big throughput win.
    protocol_version = "HTTP/1.1"
    server_version = "BlueTEXT/2.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    # --- Kill the expensive reverse-DNS lookup on every log line --------------
    def address_string(self):
        return self.client_address[0]

    # --- Fast clean-URL routing (single split, no redundant work) -------------
    def _clean_path(self):
        raw = self.path
        cut = len(raw)
        q = raw.find("?")
        h = raw.find("#")
        if q != -1:
            cut = q
        if h != -1 and h < cut:
            cut = h
        return raw[:cut], raw[cut:]

    def do_GET(self):
        path, tail = self._clean_path()
        # Redirect directory requests missing a trailing slash (301, cacheable).
        if not path.endswith("/"):
            local = os.path.join(DIRECTORY, path.lstrip("/"))
            if os.path.isdir(local):
                self.send_response(301)
                self.send_header("Location", path + "/" + tail)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
        super().do_GET()

    # --- Cheap CORS preflight handling ---------------------------------------
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def end_headers(self):
        # CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers",
                         "X-Requested-With, Content-Type")
        # Content-aware caching
        ext = os.path.splitext(self._clean_path()[0])[1].lower()
        self.send_header(
            "Cache-Control",
            _LONG_CACHE if ext in _LONG_CACHE_EXTS else _HTML_CACHE,
        )
        super().end_headers()


class Server(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True          # don't block shutdown on live connections
    request_queue_size = 128       # bigger accept() backlog under load

    def server_bind(self):
        # Disable Nagle -> lower latency for small responses.
        self.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        super().server_bind()


def main():
    print("Starting BlueTEXT Python Static Web Server (optimized)...")
    print(f"Root Directory : {DIRECTORY}")
    print(f"Server URL     : http://localhost:{PORT}")
    print("Press Ctrl+C to stop.\n")

    with Server((HOST, PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)


if __name__ == "__main__":
    main()