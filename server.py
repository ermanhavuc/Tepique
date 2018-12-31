import sys
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn


class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass


class ChaiTeaLatteHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            f = open(self.path[1:], "rb")
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
        except IOError:
            self.send_error(404, "File Not Found")


if sys.argv[1:]:
    PORT = int(sys.argv[1])
else:
    PORT = 8080

server = ThreadingSimpleServer(("localhost", PORT), ChaiTeaLatteHandler)
print("ChaiTeaLatte HTTP Server running on localhost(127.0.0.1) using port", PORT)
try:
    while 1:
        sys.stdout.flush()
        server.handle_request()
except KeyboardInterrupt:
    print("\nShutting down server per users request.")
