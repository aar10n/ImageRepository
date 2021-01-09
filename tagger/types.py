from __future__ import annotations
from typing import Any, Iterable, Tuple, List
from dataclasses import dataclass, is_dataclass, asdict
from zope.interface import Interface, implements, verify
from enum import Enum
from threading import Thread
from box import Box
import json
import inspect


#
# Common Interfaces
#


class JSONSerializable(Interface):
  def as_json(self) -> dict:
    pass


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
    if inspect.isclass(o) and verify.verifyClass(JSONSerializable, o):
      return o.as_json()
    if isinstance(o, object) and verify.verifyObject(JSONSerializable, o):
      return o.as_json()
    if is_dataclass(o):
      return asdict(o)
    return super().default(o)


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
class Label:
  """
  Represents a label in a dataset.
  """

  # the label name and hierarchy
  classes: Tuple[str, ...]
  # alternative words for the label
  alt: Tuple[str, ...] = ()
  # keywords related to the label
  related: Tuple[str, ...] = ()


@dataclass
class BoxResult:
  """
  Represents the output of a neural net with bounding boxes.
  """

  # the object bounding box
  bbox: Box
  # the object class code
  cls: int
  # the prediction confidence
  conf: float
  # the associated label
  label: Label


@dataclass
class NetResult:
  """
  Represents the output of a neural net.
  """

  # the object class code
  cls: int
  # the prediction confidence
  conf: float
  # the associated label
  label: Label


@dataclass
class Tag:
  """
  Represents an image data tag.
  """

  # the tag type
  type: TagType
