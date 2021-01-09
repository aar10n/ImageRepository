from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Union
from dataclasses import dataclass, is_dataclass, asdict
from enum import Enum
from threading import Thread
import json


#
# Common Interfaces
#

class Serializable(ABC):
  @abstractmethod
  def as_json(self) -> Union[dict, list]:
    ...


#
# Classes
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
# Enums
#


class TagType(Enum):
  FEATURE = 0
  RELATED = 0
  COLOR = 0


#
# Data Classes
#

@dataclass
class Tag:
  """
  Represents an image data tag.
  """

  # the tag type
  type: TagType
