from threading import Thread
from typing import Any


class CustomThread(Thread):
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
