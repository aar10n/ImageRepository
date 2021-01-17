from typing import Optional, Awaitable, List
from tornado.gen import coroutine
import tornado.ioloop
import tornado.web
import json
import os
import resize


class RequestHandler(tornado.web.RequestHandler):
  def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
    return super(RequestHandler, self).data_received(chunk)

  @coroutine
  def get(self):
    self.set_status(200)

  @coroutine
  def post(self):
    files = self.__validate_post_args()
    if files is None:
      return

    self.set_status(200)
    self.finish()

    print('resizing images')
    print(files)
    resize.resize(files)

  # private methods

  def __validate_post_args(self) -> Optional[List[str]]:
    def all_files(l: list) -> bool:
      return all([isinstance(el, str) and os.path.isfile(el) for el in l])

    content_type = self.request.headers['Content-Type'].replace(' ', '').split(';')
    print(self.request.body)
    if 'application/json' not in content_type:
      self.set_status(415)
      return None

    body = json.loads(self.request.body)
    if not isinstance(body, list) or not all_files(body):
      self.set_status(400)
      return None
    return body


if __name__ == "__main__":
  app = tornado.web.Application([
    (r"/", RequestHandler),
  ])

  port = 1234
  print(f'Server listening on port {port}')
  app.listen(port)
  tornado.ioloop.IOLoop.current().start()
