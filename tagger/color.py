from typing import Tuple, cast, Any, Union, Iterable
from collections.abc import Iterable as IterableClass
import numpy as np
import math

Range = Tuple[float, float]

# RGB Color Space Matrices

SRGB_to_XYZ = [
  [0.41239080, 0.35758434, 0.18048079],
  [0.21263901, 0.71516868, 0.07219232],
  [0.01933082, 0.11919478, 0.95053215]
]

XYZ_TO_SRGB = [
  [+3.24096994, -1.53738318, -0.49861076],
  [-0.96924364, +1.8759675, +0.04155506],
  [+0.05563008, -0.20397696, +1.05697151]
]

CIE_D65 = [95.047, 100, 108.883]
D = 0.206896552


def convert_range(val: Union[float, Iterable[float]], src: Range, dest: Range) -> Any:
  def convert_range_iter() -> Iterable[float]:
    for v in val:
      assert not isinstance(v, IterableClass)
      yield convert_range(v, src, dest)

  if isinstance(val, IterableClass):
    return convert_range_iter()

  old_range = src[1] - src[0]
  new_range = dest[1] - dest[0]
  return (((val - src[0]) * new_range) / old_range) + dest[0]


class Color:
  """
  Represents a CIE XYZ color and enables the conversion to
  other color models such as rgb, hex and lab.
  """
  _x: float
  _y: float
  _z: float

  def __init__(self, x: float, y: float, z: float):
    assert 0 <= x <= 255
    assert 0 <= y <= 255
    assert 0 <= z <= 255

    self._x = x
    self._y = y
    self._z = z

  def to_hex(self) -> str:
    c = self.to_rgb()
    return '#' + ''.join(['%02X' % v for v in c])

  def to_lab(self) -> Tuple[float, float, float]:
    def f(t: float) -> float:
      if t > pow(D, 3):
        return pow(t, 1 / 3)
      return (t / (3 * pow(D, 2))) + (4 / 29)

    x, y, z = tuple(convert_range(self.to_xyz(), (0, 1), (0, 100)))
    xr, yr, zr = CIE_D65

    l = 116 * f(y / yr) - 16
    a = 500 * (f(x / xr) - f(y / yr))
    b = 200 * (f(y / yr) - f(z / zr))
    return l, a, b

  def to_lch(self) -> Tuple[float, float, float]:
    l, a, b = self.to_lab()
    c = math.sqrt((a ** 2) + (b ** 2))
    h = math.atan2(b, a)
    if h < 0:
      h += math.radians(360)

    h = math.degrees(h)
    return l, c, h

  def to_rgb(self) -> Tuple[int, int, int]:
    def linear_to_srgb(u: float) -> float:
      if u <= 0.0031308:
        return 12.92 * u
      return 1.055 * pow(u, 1 / 2.4) - 0.055

    c = np.matmul(XYZ_TO_SRGB, np.asarray(self.to_xyz()).reshape((3, 1))).reshape(3)
    result = [int(round(linear_to_srgb(v) * 255)) for v in c.reshape(3)]
    return cast(Any, tuple(result))

  def to_xyz(self) -> Tuple[float, float, float]:
    return self._x, self._y, self._z


# Color Conversion Functions

def from_hex(s: str) -> Color:
  if s.startswith('#'):
    s = s[1:]

  assert len(s) == 6
  vals = [int(s[i:i + 2], 16) for i in range(0, len(s), 2)]
  return from_rgb(*vals)


def from_rgb(r: int, g: int, b: int) -> Color:
  def srgb_to_linear(u: float) -> float:
    if u <= 0.04045:
      return u / 12.92
    return pow((u + 0.055) / 1.055, 2.4)

  c = (r, g, b)
  assert all([0 <= v <= 255 for v in c])

  c = np.asarray([[srgb_to_linear(v / 255)] for v in c])
  result = np.matmul(SRGB_to_XYZ, c).reshape(3)
  return Color(*result)


# Other Color Functions

def CIE76(a: Color, b: Color):
  """
  CIE 1976 Color Difference.
  Calculates the perceived difference between two colors
  using their Lab color representations.
  """
  L1, a1, b1 = a.to_lab()
  L2, a2, b2 = b.to_lab()
  return math.sqrt(pow(L2 - L1, 2) + pow(a2 - a1, 2) + pow(b2 - b1, 2))
