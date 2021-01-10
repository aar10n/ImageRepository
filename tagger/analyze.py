from typing import Tuple, Dict, Any
import numpy as np
from image import Image
from predict import run_predict, NetResults

THRESHOLD = 0.3


def add_list_item(d: Dict[str, list], key: str, value: Any):
  if key in d:
    d[key] += [value]
  else:
    d[key] = [value]


#

def count_instances(results: NetResults) -> Tuple[dict, dict]:
  a_instances = {}
  b_instances = {}

  for a, b in results:
    if a.conf > THRESHOLD:
      add_list_item(a_instances, a.to_str(), a)
    if b.conf > THRESHOLD:
      add_list_item(b_instances, b.to_str(), b)

  return a_instances, b_instances


def analyze_results(results: NetResults):
  a_instances, b_instances = count_instances(results)

  for a, b in results:
    print(a)
    print(b)
    print('')
    print(a.label.relates(to=b.label))

  print('-------- A --------')
  for key in a_instances:
    items = a_instances[key]
    avg = np.average([n.conf for n in items])
    print(f'{key} - {len(items)} instances (average: {avg})')
  print('-------- B --------')
  for key in b_instances:
    items = b_instances[key]
    avg = np.average([n.conf for n in items])
    print(f'{key} - {len(items)} instances (average: {avg})')


def run_analyze(img: Image):
  """
  Analyzes and returns information on the given image.

  :param img:
  :return:
  """
  res_type, results = run_predict(img.data)
  analyze_results(results)
