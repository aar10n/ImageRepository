# A simple script to upload a large number
# of images in batched uploads
import sys
import os
import requests
import asyncio
import mimetypes

MAX_THREADS = 12
CHUNK_SIZE = 4

UPLOAD_URL = 'http://localhost/api/images'


def make_formdata(path: str):
  name = os.path.basename(path)
  data = open(path, 'rb')
  mime = mimetypes.guess_type(path)[0]
  return 'files[]', (name, data, mime)


def upload(paths: list):
  to_upload = [make_formdata(path) for path in paths]
  res = requests.post(UPLOAD_URL, files=to_upload)
  if res.status_code not in [200, 201]:
    print(f'{res.status_code} - upload failed')
  else:
    print(f'{res.status_code} - chunk uploaded')


async def main(paths: list):
  l = asyncio.get_event_loop()
  futures = []
  while len(paths) > 0:
    chunk_size = min(CHUNK_SIZE, len(paths))
    chunk = paths[:chunk_size]
    paths = paths[chunk_size:]
    print('uploading chunk:', chunk)
    futures += [l.run_in_executor(None, upload, chunk)]

  for future in futures:
    await future


if __name__ == '__main__':
  if len(sys.argv) < 2:
    sys.stderr.write("error: please supply a path\n")
    sys.exit(1)

  path = sys.argv[1]
  if os.path.isdir(path):
    files = [os.path.join(path, f) for f in os.listdir(path)]
  else:
    files = [path]

  loop = asyncio.get_event_loop()
  loop.run_until_complete(main(files))
