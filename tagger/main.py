from typing import Optional, Awaitable
from color import extract_palette, Color, Colors
from common.types import ImageData
from color import CIE00, from_hex
import tornado.ioloop
import tornado.web
import analyze
import os


IMAGE_DIR = os.path.abspath('../data/tmp')
MIME_TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"]


class RequestHandler(tornado.web.RequestHandler):
  def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
    return super(RequestHandler, self).data_received(chunk)

  def get(self):
    self.write("Hello, world")

  def post(self):
    im = self.__validate_post_args()
    if im is None:
      return
    print(im.shape)

    analyze.run_analysis(im)
    self.set_status(200)

  # private methods

  def __validate_post_args(self) -> Optional[ImageData]:
    image_id = self.request.body_arguments.get('id')
    files = self.request.files.get('file')
    if image_id is None or files is None or len(files) != 1:
      self.set_status(400)
      return None

    file = files[0]
    if file['content_type'] not in MIME_TYPES:
      self.set_status(415)
      return None

    return ImageData(str(image_id), file)


if __name__ == "__main__":
  app = tornado.web.Application([
    (r"/", RequestHandler),
  ])

  port = 8888
  print(f'Server listening on port {port}')
  app.listen(port)
  tornado.ioloop.IOLoop.current().start()
