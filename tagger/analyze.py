from typing import Tuple, List
from timeit import default_timer as timer

import cv2

from common.types import ImageData, Tag, TagType, Orientation
from model.dataset import Label
from predict import run_predict, NetResults
from color import Colors, extract_palette, Color
from common import utils
import numpy as np
import math


KEYWORD_FILTER = [
  'object',
  'structure',
]


def add_bias(bias: float, value: float) -> float:
  return max(0.0, min(bias + value, 1.0))


def count_instances(results: NetResults) -> Tuple[dict, dict]:
  a_count = {}
  b_count = {}

  for a, b in results:
    utils.add_to_key(a_count, a.to_str(), 1)
    utils.add_to_key(b_count, b.to_str(), 1)

  return a_count, b_count


def group_labels(labels: List[Label]) -> List[Tuple[Label, int]]:
  unique = list(utils.unique(labels))
  return [(l, labels.count(l)) for l in unique]


def labels_to_tags(labels: List[Label]) -> List[Tag]:
  def keyword_filter(w: str):
    return lambda k: k != w and k not in KEYWORD_FILTER

  labels = group_labels(labels)

  tags = []
  keywords = []
  for label, count in labels:
    tags += [Tag(TagType.FEATURE, (label.name, count))]
    keywords += list(filter(keyword_filter(label.name), label.keywords))

  for keyword in utils.unique(keywords):
    tags += [Tag(TagType.KEYWORD, keyword)]
  return tags


def colors_to_tags(colors: List[Color]) -> List[Tag]:
  print('colors', colors)

  def is_grayscale(c: Color) -> bool:
    return False
    # return c == Colors.BLACK or \
    #        c == Colors.WHITE or \
    #        c == Colors.WHITE

  if all(map(is_grayscale, colors)):
    return [Tag(TagType.COLOR, 'bw')]

  colors = [c for c in colors if not is_grayscale(c)]
  return [Tag(TagType.COLOR, str(c)) for c in colors]


def get_image_info(img: np.ndarray) -> Tuple[int, int, Orientation]:
  h, w = img.shape[:2]
  wh = w / h
  hw = h / w
  diff = abs(wh - hw)

  if diff <= 0.1:
    return w, h, Orientation.SQUARE
  elif w > h:
    return w, h, Orientation.LANDSCAPE
  return w, h, Orientation.PORTRAIT


#

def analyze_results(results: NetResults):
  def group_bias(n: int) -> float:
    return 0.4988 - (1 / (pow(math.e, 0.62 * n - 5) + 2))

  labels = []
  a_count, b_count = count_instances(results)
  for a, b in results:
    x = a.label
    y = b.label

    xc = add_bias(a.conf, group_bias(a_count[a.to_str()]))
    yc = add_bias(b.conf, group_bias(b_count[b.to_str()]))

    # print('>>>', x, xc)
    # print('>>>', y, yc)
    # print('')

    threshold = 0.25
    if x.classes == y.classes:
      # x and y are identical
      pass
    elif x.is_parent(y) and xc >= threshold:
      # x is a parent of y
      if yc >= threshold:
        x = y.union(x)
    elif y.is_parent(x) and yc >= threshold:
      # y is a parent of x
      if xc >= threshold:
        y = x.union(y)
    elif x.is_related(y):
      # x is related to y
      xc = add_bias(xc, 0.1)
    elif y.is_related(x):
      # y is related to x
      yc = add_bias(yc, 0.1)
    elif len(x.common(y)) > 1:
      # x and y have at least 2 words in common
      threshold = 0.4
    else:
      # x and y are not similar at all
      threshold = 0.5

    # pick the label with the highest confidence
    if xc >= threshold and xc >= yc:
      labels += [x]
    elif yc >= threshold:
      labels += [y]

  return labels_to_tags(labels)


def analyze_colors(img: np.ndarray) -> List[Tag]:
  img = img[:, :, ::-1]
  target = 1000

  h, w = img.shape[:2]
  if w > target and w > h:
    img = utils.resize(img, width=target)
  elif h > target and h > w:
    img = utils.resize(img, height=target)
  elif w > target and h > target:
    img = utils.resize(img, width=target, height=target)

  colors = extract_palette(img)
  colors = [Colors.find_closest(c) for c in colors]
  return colors_to_tags(colors)


def run_analysis(img: ImageData) -> dict:
  """
  Analyzes and returns information on the given image.

  :param img:
  :return:
  """
  tags = []

  a_start = timer()
  results = run_predict(img.data)
  a_end = timer()

  b_start = timer()
  tags += analyze_results(results)
  # tags += analyze_colors(img.data)
  b_end = timer()

  width, height, orientation = get_image_info(img.data)

  print('----- Analysis Results -----')
  print(f'width: {width} | height: {height} | orientation: {orientation}')
  for tag in tags:
    print(tag)
  print('----------------------------')
  print(f'Inference took {a_end - a_start} seconds')
  print(f'Analysis took {b_end - b_start} seconds')
  print('')

  return {
    'width': width,
    'height': height,
    'orientation': orientation,
    'tags': tags
  }
