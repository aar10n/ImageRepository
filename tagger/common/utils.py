"""
Shared utility functions
"""
from typing import Any, Generator, Iterable, Sequence
import numpy as np
import cv2


def add_to_key(d: dict, key: Any, value: Any):
  if key in d:
    d[key] += value
  else:
    d[key] = value


def intersection(a: Sequence, b: Sequence) -> Generator:
  for n in a:
    if n in b:
      yield n


def resize(img: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
  if width is None and height is None:
    return img

  if width is None:
    value = height / img.shape[0]
    width = int(img.shape[1] * value)
  elif height is None:
    value = width / img.shape[1]
    height = int(img.shape[0] * value)

  if width > img.shape[1] or height > img.shape[0]:
    interp = cv2.INTER_AREA
  else:
    interp = cv2.INTER_LINEAR

  return cv2.resize(img, (width, height), interpolation=interp)


def scale(img: np.ndarray, value: float) -> np.ndarray:
  width = int(img.shape[1] * value)
  height = int(img.shape[0] * value)
  return cv2.resize(img, (width, height), interpolation=cv2.INTER_AREA)


def union(a: Sequence, b: Sequence) -> Generator:
  def duplicate(s: Sequence, index: int):
    a_index = index + 1 if s is b else index
    return (
      s[index] in a[:min(a_index, len(a))] or
      s[index] in b[:min(index, len(b))]
    )

  for i in range(max(len(a), len(b))):
    if i < len(a) and not duplicate(a, i):
      yield a[i]
    if i < len(b) and not duplicate(b, i):
      yield b[i]


def unique(s: Sequence) -> Generator:
  for i in range(len(s)):
    if s[i] not in s[:i]:
      yield s[i]


def unpack(itr: Iterable) -> Generator:
  for item in itr:
    if isinstance(item, Sequence) and len(item) == 1:
      yield item[0]
    else:
      yield item
