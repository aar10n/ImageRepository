from typing import List

import numpy as np
from predict import PredictResult


def run_analyze(img: np.ndarray, pred: List[PredictResult]):
  """
  Analyzes the given image and reutrns a number of tags describing
  image features, colors and more.

  :param img:
  :param pred:
  :return:
  """
