#
# Image related functions
#
import numpy as np
import cv2


class Image:
  image_id: str
  file_name: str
  content_type: str
  data: np.ndarray

  def __init__(self, image_id: str, file: dict):
    self.image_id = image_id
    self.file_name = file['filename']
    self.content_type = file['content_type']

    nparr = np.frombuffer(file['body'], np.uint8)
    self.data = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

  @property
  def shape(self) -> tuple:
    return self.data.shape

  def dominant_color(self):
    img = np.reshape(self.data, (-1, 3))
    print(img.shape)
    img = np.float32(img)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    flags = cv2.KMEANS_RANDOM_CENTERS
    compact, labels, centers = cv2.kmeans(img, 1, None, criteria, 10, flags)
    print(centers)
    print(centers[0].astype(np.int32))

    # img2d = np.reshape(self.data, (-1, self.shape[-1]))
    # color_range = (256, 256, 256)
    # img1d = np.ravel_multi_index(img2d.T, color_range)
    # result = np.unravel_index(np.bincount(img1d).argmax(), color_range)
    # print(result)
