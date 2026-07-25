#!/usr/bin/env python3
"""
BlueTEXT Static Development & Production Web Server
Zero external dependencies - Uses Python 3 standard library.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for static assets
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def main():
    print(f"Starting BlueTEXT Python Static Web Server...")
    print(f"Root Directory: {DIRECTORY}")
    print(f"Server URL: http://localhost:{PORT}")
    print(f"Press Ctrl+C to stop.\n")
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == '__main__':
    main()
