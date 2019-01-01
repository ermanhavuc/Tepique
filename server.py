import sys, getopt
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn


class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass


class TepiqueServer(BaseHTTPRequestHandler):

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

IP = None
PORT = None

try:
    opts, args = getopt.getopt(sys.argv[1:],"hi:p:",["ip=","port="])
except getopt.GetoptError:
    print('tepique_server.py -i <ip address> -p <port>')
    sys.exit(2)
for opt, arg in opts:
    if opt == '-h':
        print('tepique_server.py -i <ip address> -p <port>')
        sys.exit()
    elif opt in ("-i", "--ip"):
        IP = arg
    elif opt in ("-p", "--port"):
        PORT = int(arg)

if IP is None:
    IP = "192.168.0.10"
if PORT is None:
    PORT = 8080


server = ThreadingSimpleServer((IP, PORT), TepiqueServer)
print("Tepique Server running on %s using port %d" %(IP, PORT))

try:
    while 1:
        sys.stdout.flush()
        server.handle_request()
except KeyboardInterrupt:
    print("\nShutting down server per users request.")
