from typing import List
from multiprocessing import Pool
import numpy as np
from os import path
import os
import cv2

IMAGE_DIR = '../data/images'
OUT_DIR = path.join(path.abspath(IMAGE_DIR), 'thumbnails')
TARGET_HEIGHT = 500


# resize to a width or height preserving the aspect ratio
def locked_resize(img: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
  if width is None and height is None:
    return img

  if width is None:
    value = height / img.shape[0]
    width = int(img.shape[1] * value)
  elif height is None:
    value = width / img.shape[1]
    height = int(img.shape[0] * value)

  return cv2.resize(img, (width, height), interpolation=cv2.INTER_LINEAR)


def do_resize(file: str):
  print(f'resizing {file}')
  image = cv2.imread(file)
  h, w = image.shape[:2]
  if h <= TARGET_HEIGHT:
    return

  name = path.join(OUT_DIR, path.basename(file))
  print(f'writing to {name}')
  try:
    os.remove(name)
  except OSError:
    pass
  cv2.imwrite(name, locked_resize(image, height=TARGET_HEIGHT))


def resize(files: List[str]):
  if not path.exists(OUT_DIR):
    os.mkdir(OUT_DIR)

  if len(files) < 4:
    for file in files:
      do_resize(file)
  else:
    with Pool(4) as pool:
      pool.map(do_resize, files)
