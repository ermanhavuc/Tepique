import sys, socket
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from mimetypes import guess_type

class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass

class TepiqueServer(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            filepath = self.path[1:]
            if filepath is "" :
                f = open("index.html", "rb")
                filetype = "text/html"
            else:
                f = open(filepath, "rb")
                filetype = guess_type(filepath)
            self.send_response(200)
            self.send_header("Content-Type", filetype)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
        except IOError:
            self.send_error(404, "File Not Found")


IP = socket.gethostbyname(socket.getfqdn())
PORT = 80

server = ThreadingSimpleServer((IP, PORT), TepiqueServer)
print("Tepique Server - %s:%d" %(IP, PORT))

server.serve_forever()
