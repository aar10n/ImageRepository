import http.server
import random
import string
import sys
import os

def seed():
  chars = string.ascii_letters
  output = ''
  for _ in range(6):
    output += random.choice(chars)
  return output

class RequestHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, directory=None, **kwargs):
    if directory is None:
      directory = os.getcwd()
    self.directory = os.fspath(directory)
    self.files = os.listdir(self.directory)
    super().__init__(*args, **kwargs)
    
  def do_GET(self) -> None:
    self.parse_query_params()
    if self.path == '/':
      count = 1
      if 'count' in self.params:
        try:
          count = max(int(self.params['count']), 1)
        except:
          self.send_response(401)
          return None

      print('count =', count)

      rseed = ''
      if 'seed' in self.params:
        rseed = self.params['seed']
      else:
        rseed = seed()
      
      print('seed =', rseed)
      random.seed(rseed)

      enc = sys.getfilesystemencoding()
      files = [random.choice(self.files) for _ in range(count)]
      files_json = ','.join(map(lambda f : f'"{f}"', files))
      body = '{ "urls": [%s], "seed": "%s" }' % (files_json, rseed)
      encoded = body.encode(enc, 'surrogateescape')

      self.send_response(200)
      self.send_header('Content-type', 'application/json; charset=%s' % enc)
      self.send_header('Content-Length', str(len(encoded)))
      self.end_headers()
      self.wfile.write(encoded)
      return None

    if self.path == '/favicon.ico':
      self.send_error(404, "File not found")
      return None
    return super().do_GET()

  def end_headers(self) -> None:
    self.send_header('Access-Control-Allow-Origin', '*')
    super().end_headers()

  def parse_query_params(self) -> None:
    self.params = {}
    parts = self.path.split('?')
    if len(parts) <= 1:
      return None
    self.path = parts[0]

    parts = parts[1:]
    for part in parts:
      part = part.split('#')[0]
      pairs = [p.split('=') for p in part.split(';')]
      for pair in pairs:
        if len(pair) == 1:
          self.params[pair[0]] = True
        else:
          self.params[pair[0]] = pair[1]


if __name__ == '__main__':
  if len(sys.argv) >= 2:
    os.chdir(sys.argv[1])
  
  server_address = ('localhost', 8000)
  httpd = http.server.HTTPServer(server_address, RequestHandler)
  print(f'Serving on port {server_address[1]}')
  httpd.serve_forever()
