import tensorflow_hub as hub
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import cv2
from timeit import default_timer as timer


# detector = hub.load("https://tfhub.dev/tensorflow/faster_rcnn/inception_resnet_v2_640x640/1")
model = tf.keras.Sequential([
  hub.KerasLayer('https://tfhub.dev/google/imagenet/mobilenet_v2_050_192/classification/4')
])
model.build([None, 192, 192, 3])  # Batch input shape.


def scale_image(img: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
  h, w = img.shape[:2]
  if height is not None:
    scale_y = height / h
  else:
    assert width is not None
    scale_y = width / w

  if width is not None:
    scale_x = width / w
  else:
    assert height is not None
    scale_x = height / h

  h = int(h * scale_y)
  w = int(w * scale_x)
  resized = cv2.resize(img, (h, w), interpolation=cv2.INTER_AREA)
  return resized


def resize_image(img: np.ndarray, shape: tuple) -> np.ndarray:
  result = np.zeros(shape)
  result[:img.shape[0], :img.shape[1]] = img
  return result


def run_recog(img: np.ndarray):
  img = scale_image(img, width=192)
  print(img.shape)
  img = resize_image(img, (192, 192, 3))
  print(img.shape)
  cv2.imwrite('resized.png', img)
  tensor = tf.convert_to_tensor(np.expand_dims(img, axis=0), tf.float32, name='inputs')

  start = timer()
  # detector_output = detector([tensor])
  classes = model.predict(tensor, batch_size=1, use_multiprocessing=True)
  end = timer()

  print(f'Inference took {end - start} seconds')
  print(classes)
