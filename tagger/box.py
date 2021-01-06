from __future__ import annotations
from typing import List, Tuple, Optional
from enum import Enum
import numpy as np

BGRImage = np.ndarray


class BoxType(Enum):
  XYXY_BL = 0  # bottom left origin (x1, y1, x2, y2)
  XYXY_TL = 1  # top left origin (x1, y1, x2, y2)
  XYWH_BL = 2  # bottom left origin (x, y, w, h)
  XYWH_TL = 3  # top left origin (x, y, w, h)

  def is_xyxy(self):
    return self == BoxType.XYXY_BL or self == BoxType.XYXY_TL

  def is_xywh(self):
    return self == BoxType.XYWH_BL or self == BoxType.XYWH_TL

  def is_tl(self):
    return self == BoxType.XYXY_TL or self == BoxType.XYWH_TL

  def is_bl(self):
    return self == BoxType.XYXY_BL or self == BoxType.XYWH_BL


class Box:
  x: float
  y: float
  xmax: float
  ymax: float
  points: List[float]

  def __init__(self, points: List[float], box_type=BoxType.XYXY_BL):
    assert len(points) == 4

    self.points = Box.__normalize_points(points, box_type)
    self.box_type = box_type
    x1, y1, x2, y2 = self.points

    self.x = x1
    self.y = y1
    self.xmax = x2
    self.ymax = y2

  def __str__(self):
    return f'[({self.x}, {self.y}), ({self.xmax}, {self.ymax})]'

  def __repr__(self):
    return self.__str__()

  #

  @property
  def box(self) -> List[float]:
    return Box.__convert_points(self.points, self.box_type)

  @property
  def polygon(self) -> List[float]:
    return [self.x, self.y, self.xmax, self.y,
            self.xmax, self.ymax, self.x, self.ymax]

  @property
  def vertices(self) -> List[Tuple[float, float]]:
    return [(self.x, self.y), (self.xmax, self.y), (self.xmax, self.ymax),
            (self.x, self.ymax), (self.x, self.y)]

  @property
  def width(self) -> float:
    return abs(self.xmax - self.x)

  @property
  def height(self) -> float:
    return abs(self.ymax - self.y)

  @property
  def dimensions(self) -> Tuple[float, float]:
    return self.width, self.height

  @property
  def area(self) -> float:
    return self.width * self.height

  #

  def intersects(self, box: Box) -> bool:
    return ((self.xmax > box.x and box.xmax > self.x) and
            (self.ymax > box.y and box.ymax > self.y))

  def contains(self, box: Box) -> bool:
    return ((self.x <= box.x and self.y <= box.y) and
            (self.xmax >= box.xmax and self.ymax >= box.ymax))

  def equals(self, box: Box) -> bool:
    return ((self.x == box.x and self.y == box.y) and
            (self.xmax == box.xmax and self.ymax == box.ymax))

  #

  def crop(self, img: BGRImage) -> BGRImage:
    x1, y1, x2, y2 = map(lambda p: max(int(p), 0), self.points)
    return img[y1:y2, x1:x2]

  def convert(self, to_type: BoxType) -> Box:
    points = self.__convert_points(self.points, to_type)
    return Box(points, to_type)

  def scale(self, factor: int) -> Box:
    assert factor > 0

    dx = ((factor * self.width) + self.x - self.xmax) / 2
    dy = ((factor * self.height) + self.y - self.ymax) / 2
    points = [self.x - dx, self.y - dy, self.xmax + dx, self.ymax + dy]
    return Box(points).convert(self.box_type)

  def tile(self, dx: int, dy: int) -> Box:
    w, h = self.dimensions

    ox = dx * w
    oy = dy * h

    x1 = self.x + ox
    y1 = self.y + oy
    x2 = self.xmax + ox
    y2 = self.ymax + oy
    points = [x1, y1, x2, y2]
    return Box(points).convert(self.box_type)

  def intersection(self, box: Box) -> Optional[Box]:
    if not self.intersects(box):
      return None

    x1 = max(self.x, box.x)
    y1 = max(self.y, box.y)
    x2 = min(self.xmax, box.xmax)
    y2 = min(self.ymax, box.ymax)
    points = [x1, y1, x2, y2]
    return Box(points).convert(self.box_type)

  def union(self, box: Box) -> Optional[Box]:
    if not self.intersects(box):
      return None

    x1 = min(self.x, box.x)
    y1 = min(self.y, box.y)
    x2 = max(self.xmax, box.xmax)
    y2 = max(self.ymax, box.ymax)
    points = [x1, y1, x2, y2]
    return Box(points).convert(self.box_type)

  def iou(self, box: Box) -> float:
    inter = self.intersection(box)
    if inter is None:
      return 0
    return inter.area / (self.area + box.area - inter.area)

  # internal methods

  @staticmethod
  def __get_dimensions(points: List[float], box_type: BoxType) -> Tuple[float, float]:
    if box_type.is_xyxy():
      x1, y1, x2, y2 = points
      return abs(x2 - x1), abs(y2 - y1)
    else:
      _, _, w, h = points
      return w, h

  @staticmethod
  def __normalize_points(points: List[float], from_type: BoxType) -> List[float]:
    assert len(points) == 4

    if from_type.is_bl():
      if from_type.is_xyxy():
        return points[:]
      else:
        x, y, w, h = points
        return [x, y, x + w, y + h]
    else:
      if from_type.is_xyxy():
        x1, y1, x2, y2 = points
        _, h = Box.__get_dimensions(points, from_type)
        return [x1, y1 - h, x2, y2 + h]
      else:
        x, y, w, h = points
        return [x, y - h, x + w, y]

  @staticmethod
  def __convert_points(points: List[float], to_type: BoxType) -> List[float]:
    w, h = Box.__get_dimensions(points, BoxType.XYXY_BL)
    if to_type.is_bl():
      if to_type.is_xyxy():
        return points[:]  # XYXY_BL
      else:
        return [points[0], points[1], w, h]  # XYWH_BL
    else:
      d = [0, h, 0, -h]
      tl = list(map(sum, zip(points, d)))
      if to_type.is_xyxy():
        return tl  # XYXY_TL
      else:
        return [tl[0], tl[1], w, h]  # XYWH_TL
