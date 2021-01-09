from typing import List, Tuple
import numpy as np
from model import ResultType
from image import Image
from predict import run_predict, BoxResults, NetResults


def analyze_box_results(results: BoxResults):
  pass


def analyze_net_results(results: NetResults):
  pass


def run_analyze(img: Image):
  """
  Analyzes and returns information on the given image.

  :param img:
  :return:
  """
  result_type, results = run_predict(img.data)
  if result_type == ResultType.BOX:
    analyze_box_results(results)
  elif result_type == ResultType.NET:
    analyze_net_results(results)
