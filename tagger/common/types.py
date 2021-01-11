from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Union
from dataclasses import dataclass, is_dataclass, asdict
from enum import Enum
from threading import Thread
import numpy as np
import json
import cv2


class Serializable(ABC):
  @abstractmethod
  def as_json(self) -> Union[dict, list]:
    ...


#

class CustomThread(Thread):
  """
  A custom `Thread` subclass that adds the ability to
  return values from the target functions.
  """
  def __init__(self, group=None, target=None, name=None,
               args=(), kwargs=None, *, daemon=None):
    super().__init__(group=group, target=target, name=name,
                     args=args, kwargs=kwargs, daemon=daemon)
    self._value = None

  def run(self):
    try:
      if self._target:
        self._value = self._target(*self._args, **self._kwargs)
    finally:
      del self._target, self._args, self._kwargs

  def join(self, timeout=None) -> Any:
    super().join(timeout)
    return self._value


class CustomJSONEncoder(json.JSONEncoder):
  """
  A custom `JSONEncoder` subclass that adds the ability to
  serialize data classes into json automatically.
  """
  def default(self, o: Any) -> Any:
    if isinstance(o, Serializable):
      return o.as_json()
    if is_dataclass(o):
      return asdict(o)
    return json.JSONEncoder.default(self, o).default(o)


#

class TagType(Enum):
  KEYWORD = 'keyword'
  COLOR = 'color'
  ORIENTATION = 'orientation'


#

class ImageData:
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
  def shape(self):
    return self.data.shape


@dataclass
class Tag:
  """
  Represents an image data tag.
  """
  # the tag's type
  type: TagType
  # the tag's value
  value: str
