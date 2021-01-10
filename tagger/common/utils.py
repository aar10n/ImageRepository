"""
Shared utility functions
"""
from typing import Any, Generator, Iterable, Sequence


def add_to_key(d: dict, key: Any, value: Any):
  if key in d:
    d[key] += value
  else:
    d[key] = value


def intersection(a: Sequence, b: Sequence) -> Generator:
  for n in a:
    if n in b:
      yield n


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


def unpack(itr: Iterable) -> Generator:
  for item in itr:
    if isinstance(item, Sequence) and len(item) == 1:
      yield item[0]
    else:
      yield item
