"""
Shared utility functions
"""
from typing import Any, Iterable, Sequence


def unpack(itr: Iterable[Any]) -> Iterable[Any]:
  for item in itr:
    if isinstance(item, Sequence) and len(item) == 1:
      yield item[0]
    else:
      yield item
