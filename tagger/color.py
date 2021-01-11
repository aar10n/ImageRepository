from typing import Tuple, cast, Any, Union, Iterable, List
from collections.abc import Iterable as IterableClass
from math import sqrt, sin, cos, atan2, exp, pow, radians, degrees
from colorgram import colorgram
from PIL import Image
import numpy as np

Range = Tuple[float, float]


#
# Constants and Helpers
#

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

CIE_D65 = [95.047, 100.0, 108.883]
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


#
# Color Class
#

class Color:
  """
  Represents a CIE XYZ color and enables the conversion to
  other color models such as rgb, hex and lab.
  """
  _x: float
  _y: float
  _z: float
  _name: str

  def __init__(self, x: float, y: float, z: float, name: str = None):
    assert 0 <= x <= 255
    assert 0 <= y <= 255
    assert 0 <= z <= 255

    self._x = x
    self._y = y
    self._z = z
    self._name = name or self.to_hex()

  def __repr__(self):
    return self._name

  def __str__(self):
    return self._name

  def to_str(self) -> str:
    return self._name

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
    c = sqrt((a ** 2) + (b ** 2))
    h = atan2(b, a)
    if h < 0:
      h += radians(360)

    h = degrees(h)
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


#
# Color Conversion Functions
#

def from_hex(s: str, name: str = None) -> Color:
  if s.startswith('#'):
    s = s[1:]

  assert len(s) == 6
  vals = [int(s[i:i + 2], 16) for i in range(0, len(s), 2)]
  return from_rgb(*vals, name=name)


def from_rgb(r: int, g: int, b: int, name: str = None) -> Color:
  def srgb_to_linear(u: float) -> float:
    if u <= 0.04045:
      return u / 12.92
    return pow((u + 0.055) / 1.055, 2.4)

  c = (r, g, b)
  assert all([0 <= v <= 255 for v in c])

  c = np.asarray([[srgb_to_linear(v / 255)] for v in c])
  result = np.matmul(SRGB_to_XYZ, c).reshape(3)
  return Color(*result, name=name)


#
# Other Color Functions
#

def extract_palette(img: np.ndarray, num_colors: int = 5) -> List[Color]:
  img = Image.fromarray(img)
  colors = colorgram.extract(img, num_colors)
  return [from_rgb(*c.rgb) for c in colors]


def is_grayscale(color: Color) -> bool:
  r, g, b = color.to_rgb()
  return r == g and g == b


#
# Color Difference Algorithms
#

def CIE76(a: Color, b: Color):
  """
  CIE 1976 Color Difference Algorithm.
  Calculates the human perceived difference between two colors.
  """
  L1, a1, b1 = a.to_lab()
  L2, a2, b2 = b.to_lab()
  return sqrt(pow(L2 - L1, 2) + pow(a2 - a1, 2) + pow(b2 - b1, 2))


def CIE00(x: Color, y: Color) -> float:
  """
  CIE 2000 Color Difference Algorithm.
  Calculates the human perceived difference between two colors.
  http://www2.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
  """
  rad = lambda d: radians(d)
  pow2 = lambda v: pow(v, 2)

  Kl = 1
  Kc = 1
  Kh = 1

  x1, y1, z1 = x.to_lab()
  x2, y2, z2 = y.to_lab()

  Lo = {1: x1, 2: x2}
  ao = {1: y1, 2: y2}
  bo = {1: z1, 2: z2}

  # 1. Calculate C'i and h'i
  calc_C_ab = lambda i: sqrt(pow2(ao[i]) + pow2(bo[i]))
  C1_ab = calc_C_ab(1)
  C2_ab = calc_C_ab(2)

  C_ab = (C1_ab + C2_ab) / 2
  G = 0.5 * (1 - sqrt(pow(C_ab, 7) / (pow(C_ab, 7) + pow(25, 7))))

  calc_a = lambda i: (1 + G) * ao[i]
  a = {1: calc_a(1), 2: calc_a(2)}

  calc_C = lambda i: sqrt(pow2(a[i]) + pow2(bo[i]))
  C = {1: calc_C(1), 2: calc_C(2)}

  # calc_h = lambda i: atan2(bo[i], a[i]) % rad(360)
  calc_h = lambda i: degrees(atan2(bo[i], a[i])) if bo[i] > 0 else 360 + degrees(atan2(bo[i], a[i]))
  h = {1: calc_h(1), 2: calc_h(2)}

  # 2. Calculate ΔL', ΔC' and ΔH'
  dL = Lo[2] - Lo[1]
  dC = C[2] - C[1]
  dh = h[2] - h[1]
  if abs(dh) <= 180:
    dh = abs(dh)
  else:
    dh = 360 - abs(dh)

  dH = 2 * sqrt(C[1] * C[2]) * sin(rad(dh) / 2)

  # 3. Calculate CIEDE2000 Color Difference ΔE
  L_avg = (Lo[1] + Lo[2]) / 2
  C_avg = (C[1] + C[2]) / 2

  if abs(h[1] - h[2]) <= 180:
    h_avg = (h[1] + h[2]) / 2
  else:
    h_avg = (h[1] + h[2] - 360) / 2

  T = 1 - 0.17 * cos(rad(h_avg - 30)) + 0.24 * cos(rad(2 * h_avg)) \
      + 0.32 * cos(rad(3 * h_avg + 6)) - 0.2 * cos(rad(4 * h_avg - 63))

  theta = 30 * exp(-pow2((h_avg - 275) / 25))

  Rc = 2 * sqrt(pow(C_avg, 7) / (pow(C_avg, 7) + pow(25, 7)))
  Sl = 1 + ((0.015 * pow2(L_avg - 50)) / (sqrt(20 + pow2(L_avg - 50))))
  Sc = 1 + 0.045 * C_avg
  Sh = 1 + 0.015 * C_avg * T
  Rt = -sin(rad(2 * theta)) * Rc

  dLf = dL / (Kl * Sl)
  dCf = dC / (Kc * Sc)
  dHf = dH / (Kh * Sh)

  E = sqrt(pow2(dLf) + pow2(dCf) + pow2(dHf) + (Rt * dCf * dHf))
  return E


#
# Custom Color Palette
#

class Colors(object):
  BLACK = from_hex('#000000', 'black')
  WHITE = from_hex('#FFFFFF', 'white')
  GRAY = from_hex('#7F7F7F', 'gray')
  RED = from_hex('#E72525', 'red')
  ORANGE = from_hex('#F48700', 'orange')
  LIGHT_ORANGE = from_hex('#ECA71D', 'light_orange')
  YELLOW = from_hex('#F1F12A', 'yellow')
  LIGHT_GREEN = from_hex('#A9E418', 'light_green')
  GREEN = from_hex('#06D506', 'green')
  AQUAMARINE = from_hex('#0ECB9C', 'aquamarine')
  CYAN = from_hex('#1AE0E0', 'cyan')
  TURQUOISE = from_hex('#0BBBF5', 'turquoise')
  LIGHT_BLUE = from_hex('#2055F8', 'light_blue')
  BLUE = from_hex('#0000FF', 'blue')
  PURPLE = from_hex('#7F00FF', 'purple')
  VIOLET = from_hex('#BF00FF', 'violet')
  MAGENTA = from_hex('#EA06B1', 'magenta')

  @staticmethod
  def as_list() -> List[Color]:
    return [
      Colors.BLACK,
      Colors.WHITE,
      Colors.GRAY,
      Colors.RED,
      Colors.ORANGE,
      Colors.LIGHT_ORANGE,
      Colors.YELLOW,
      Colors.LIGHT_GREEN,
      Colors.GREEN,
      Colors.AQUAMARINE,
      Colors.CYAN,
      Colors.TURQUOISE,
      Colors.LIGHT_BLUE,
      Colors.BLUE,
      Colors.PURPLE,
      Colors.VIOLET,
      Colors.MAGENTA
    ]

  @staticmethod
  def find_closest(color: Color) -> Color:
    deltas = [
      (CIE00(c, color), c) for c in Colors.as_list()
    ]
    deltas.sort(key=lambda t: t[0])
    return deltas[0][1]
