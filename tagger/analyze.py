from typing import List, Tuple
import numpy as np
from model import ResultType
from image import Image
from predict import run_predict, BoxResults, NetResults


def analyze_results(results: NetResults):
  pass


def run_analyze(img: Image):
  """
  Analyzes and returns information on the given image.

  :param img:
  :return:
  """
  result_type, results = run_predict(img.data)
  analyze_results(results)
