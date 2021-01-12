from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Tuple, List, Any
from common.utils import intersection, union


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

  @property
  def depth(self) -> int:
    """
    The depth of the label heirarchy.
    A greater depth indicates that the label is
    more detailed and specific.
    """
    return len(self.classes)

  @property
  def name(self) -> str:
    """
    The last item in the label hierarchy.
    This is considered the labels proper name.
    """
    return self.classes[-1]

  @property
  def keywords(self):
    return self.classes + self.alt + self.related

  #

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
    for x, y in zip(self.classes, label.classes):
      if x == y:
        words += (x,)
      else:
        break
    return words

  def intersection(self, label: Label) -> Label:
    classes = tuple(intersection(self.classes, label.classes))
    alt = tuple(intersection(self.alt, label.alt))
    related = tuple(intersection(self.related, label.related))
    return Label(classes, alt=alt, related=related, dataset=self.dataset, cls=self.cls)

  def union(self, label: Label) -> Label:
    classes = tuple(union(self.classes, label.classes))
    alt = tuple(union(self.alt, label.alt))
    related = tuple(union(self.related, label.related))
    return Label(classes, alt=alt, related=related, dataset=self.dataset, cls=self.cls)

  def is_related(self, label: Label) -> bool:
    for related in self.related:
      if related in label.classes:
        return True
    return False

  def is_parent(self, label: Label) -> bool:
    common = self.common(label)
    return common == self.classes


class Dataset(object):
  """
  Represents a model's dataset.
  """
  __name: str
  __labels: List[(int, Label)]
  __relations: Dict[str, List[str]]
  __names: Dict[str, List[Label]]
  __registered: bool

  def __init__(self, name: str):
    self.__name = name
    self.__labels = []
    self.__relations = {}
    self.__names = {}
    self.__registered = False

  def __contains__(self, item: Any) -> bool:
    if isinstance(item, str):
      return item in self.__names
    elif isinstance(item, Label):
      if item.dataset == self:
        return True
      return self.__check_contains(item)
    else:
      raise TypeError

  def __getitem__(self, index: int) -> Label:
    if not isinstance(index, int):
      raise TypeError
    return self.__get_label(index)

  def __repr__(self) -> str:
    return self.__name

  def __str__(self) -> str:
    return self.__name

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
        self.__relations[word1] += [word2]
    else:
      self.__relations[word1] = [word2]

    if word2 in self.__relations:
      if word1 not in self.__relations[word2]:
        self.__relations[word2] += [word1]
    else:
      self.__relations[word2] = [word1]

  def register(self, labels: List[Label]):
    assert not self.__registered
    for index, label in enumerate(labels):
      label.dataset = self
      label.cls = index
      for word in label.classes:
        if word in self.__relations:
          self.__relate_label(label, self.__relations[word])

      self.__labels += [(index, label)]
      if label.name in self.__names:
        self.__names[label.name] += [label]
      else:
        self.__names[label.name] = [label]

    self.__registered = True

  #

  def __check_contains(self, label: Label) -> bool:
    name = label.name
    if name in self.__names:
      labels = self.__names[name]
      return any([l == label for l in labels])

  def __get_label(self, index: int) -> Label:
    _, label = self.__labels[index]
    return label

  def __relate_label(self, label: Label, words: List[str]):
    for word in words:
      if label.related:
        if word not in label.related:
          label.related += (word,)
      else:
        label.related = (word,)
