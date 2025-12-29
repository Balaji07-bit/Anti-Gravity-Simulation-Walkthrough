import http.server
import socketserver
import webbrowser

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
})

while True:
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Serving at http://localhost:{PORT}")
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()
        break
    except OSError:
        print(f"Port {PORT} is in use, trying {PORT+1}...")
        PORT += 1
