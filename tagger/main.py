from typing import Optional, Awaitable
import tornado.ioloop
import tornado.web
import numpy as np
import cv2
import os
import image
from timeit import default_timer as timer
from image import Image
# import recog
# import tf
# import hub
import trch

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

    start = timer()
    im.dominant_color()
    end = timer()
    print(f'Took {end - start} seconds')

    trch.run_recog(im.data)

    self.set_status(200)

  # private methods

  def __validate_post_args(self) -> Optional[Image]:
    image_id = self.request.body_arguments.get('id')
    files = self.request.files.get('file')
    if image_id is None or files is None or len(files) != 1:
      self.set_status(400)
      return None

    file = files[0]
    if file['content_type'] not in MIME_TYPES:
      self.set_status(415)
      return None

    return Image(str(image_id), file)


if __name__ == "__main__":
  app = tornado.web.Application([
    (r"/", RequestHandler),
  ])

  port = 8888
  print(f'Server listening on port {port}')
  app.listen(port)
  tornado.ioloop.IOLoop.current().start()
