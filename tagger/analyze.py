from typing import Tuple
from image import Image
from predict import run_predict, NetResults
from common import utils
import math

THRESHOLD_BASE = 0.1
THRESHOLD = 0.25


#

def add_bias(bias: float, value: float) -> float:
  return max(0.0, min(bias + value, 1.0))


def count_instances(results: NetResults) -> Tuple[dict, dict]:
  a_count = {}
  b_count = {}

  for a, b in results:
    utils.add_to_key(a_count, a.to_str(), 1)
    utils.add_to_key(b_count, b.to_str(), 1)

  return a_count, b_count


def analyze_results(results: NetResults):
  def group_bias(n: int) -> float:
    return 0.4988 - (1 / (pow(math.e, 0.62 * n - 5) + 2))

  valid = []
  a_count, b_count = count_instances(results)
  for a, b in results:
    x = a.label
    y = b.label

    xc = add_bias(a.conf, group_bias(a_count[a.to_str()]))
    yc = add_bias(b.conf, group_bias(b_count[b.to_str()]))

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
      threshold = 0.7

    # pick the label with the highest confidence
    if xc >= threshold and xc >= yc:
      label = x
      conf = xc
    elif yc >= threshold:
      label = y
      conf = yc
    else:
      label = None
      conf = 0.0

    print(label, conf)
    if label:
      valid += [(label, conf)]

  return valid


def run_analyze(img: Image):
  """
  Analyzes and returns information on the given image.

  :param img:
  :return:
  """
  res_type, results = run_predict(img.data)
  analyze_results(results)
