from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Tuple, List


@dataclass
class Label:
  """
  Represents a label in a dataset.
  """

  # the label name and hierarchy
  classes: Tuple[str, ...]
  # alternative words for the label
  alt: Tuple[str, ...] = tuple()
  # keywords related to the label
  related: Tuple[str, ...] = tuple()
  # the dataset that owns this label
  dataset: Dataset = None
  # the class this label represents
  cls: int = -1

  def __eq__(self, other: Label) -> bool:
    return self.classes == other.classes

  def common(self, label: Label) -> Tuple[str, ...]:
    """
    Returns the longest sequence of common words found in both
    label's class paths.
    For example, for the labels:
      ('animal', 'mammal', 'tiger') and
      ('animal', 'mammal', 'lion')
    This would return
      ('animal', 'mammal')
    """
    words = tuple()
    for a, b in zip(self.classes, label.classes):
      if a == b:
        words += (a,)
      else:
        break
    return words


class Dataset(object):
  """
  Represents a model's dataset.
  """
  __name: str
  __labels: List[(int, Label)]
  __relations: Dict[str, List[str]]
  __registered: bool

  def __init__(self, name: str):
    self.__name = name
    self.__labels = []
    self.__relations = {}
    self.__registered = False

  def __getitem__(self, index: int) -> Label:
    if not isinstance(index, int):
      raise TypeError
    _, label = self.__labels[index]
    return label

  def __repr__(self) -> str:
    return f'"{self.__name}" Dataset - {len(self.__labels)} classes'

  def __str__(self) -> str:
    return f'"{self.__name}" Dataset - {len(self.__labels)} classes'

  #

  @property
  def name(self):
    return self.__name

  @property
  def size(self):
    return len(self.__labels)

  #

  def relate(self, word1: str, word2: str):
    assert not self.__registered
    if word1 in self.__relations:
      if word2 not in self.__relations[word1]:
        self.__relations[word1] += word2
    else:
      self.__relations[word1] = [word2]

    if word2 in self.__relations:
      if word1 not in self.__relations[word2]:
        self.__relations[word2] += word1
    else:
      self.__relations[word2] = [word1]

  def register(self, labels: List[Label]):
    assert not self.__registered
    for index, label in enumerate(labels):
      label.dataset = self
      label.cls = index
      for word in label.classes:
        if word in self.__relations:
          self.__relate_label(label, word)
      self.__labels.append((index, label))
    self.__registered = True

  #

  def __relate_label(self, label: Label, word: str):
    if label.related:
      if word not in label.related:
        label.related += (word,)
    else:
      label.related = (word,)
