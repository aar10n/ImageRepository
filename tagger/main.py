from typing import Optional, Awaitable
from tornado.gen import coroutine
from common.types import ImageData
from common import utils
import tornado.ioloop
import tornado.web
import analyze

MIME_TYPES = ["image/gif", "image/jpeg", "image/png", "image/webp"]


class RequestHandler(tornado.web.RequestHandler):
  def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
    return super(RequestHandler, self).data_received(chunk)

  @coroutine
  def get(self):
    self.set_status(200)

  @coroutine
  def post(self):
    im = self.__validate_post_args()
    if im is None:
      return

    result = analyze.run_analysis(im)
    self.write(utils.serialize(result))
    self.set_header('Content-Type', 'application/json; charset=UTF-8')
    self.set_status(200)

  # private methods

  def __validate_post_args(self) -> Optional[ImageData]:
    files = self.request.files.get('file')
    if files is None or len(files) != 1:
      self.set_status(400)
      return None

    file = files[0]
    if file['content_type'] not in MIME_TYPES:
      self.set_status(415)
      return None

    return ImageData(file)


if __name__ == "__main__":
  app = tornado.web.Application([
    (r"/", RequestHandler),
  ])

  port = 8888
  print(f'Server listening on port {port}')
  app.listen(port)
  tornado.ioloop.IOLoop.current().start()
