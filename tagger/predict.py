from typing import Any, List, Tuple, Union
import torch
import numpy as np
import torch.nn.functional as nnf
from torchvision.transforms import transforms
from timeit import default_timer as timer
from types import CustomThread, BoxResult, NetResult
from model import yolo, mobilenet, shufflenet
from PIL import Image
from box import Box

from imagenet import imagenet_labels
from coco import coco_labels


PredictResult = Union[Tuple[BoxResult, NetResult], List[NetResult]]


def make_coco_predictor(model: Any, name: str):
  def yolo_predict(img: Image.Image) -> List[BoxResult]:
    start = timer()
    output = model([img], size=640)
    end = timer()

    print(f'{name} inference took {end - start} seconds')
    print(output)
    output.print()
    output.show()

    results = []
    for i, (*box, conf, cls) in enumerate(output.pred[0]):
      cls = int(cls.item())
      bbox = Box(list(map(lambda t: t.item(), box)))
      results += [BoxResult(bbox, cls, conf.item(), coco_labels[cls])]

    return results
  return yolo_predict


def make_imagenet_predictor(model: Any, name: str):
  def imagenet_predict(img: Image.Image, k: int = 1) -> List[NetResult]:
    tensor = preprocess(img)
    tensor = tensor.unsqueeze(0)

    with torch.no_grad():
      start = timer()
      output = model(tensor)
      end = timer()

    print(f'{name} inference took {end - start} seconds')

    print('output:', output.shape)
    results = []
    values, classes = torch.topk(nnf.softmax(output[0], dim=0), k)
    for conf, cls in zip(values, classes):
      cls = int(cls.item())
      results += [NetResult(cls, conf.item(), imagenet_labels[cls])]

    return results
  return imagenet_predict


preprocess = transforms.Compose([
  transforms.Resize(256),
  transforms.ToTensor(),
  transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


yolo_predictor = make_coco_predictor(yolo, 'Yolo')
mobilenet_predictor = make_imagenet_predictor(mobilenet, 'Mobilenet')
shufflenet_predictor = make_imagenet_predictor(shufflenet, 'Shufflenet')


def run_broad_pass(img: Image.Image) -> Tuple[NetResult, NetResult]:
  t1 = CustomThread(target=mobilenet_predictor, args=(img, 2))
  t2 = CustomThread(target=shufflenet_predictor, args=(img, 2))
  t1.start()
  t2.start()
  return t1.join(), t2.join()


def run_predict(img: np.ndarray) -> List[PredictResult]:
  """
  Runs the given image through a series of neural nets and generates
  predictions about features in the image. The results may or may not
  contain bounding boxes, and with some images there may not be any
  results at all.

  :param img: The image to run predictions on.
  :return: A list of prediction results
  """

  # convert BGR to RGB and load as PIL image
  img = Image.fromarray(img[:, :, ::-1])

  start = timer()
  # -------------

  # first run on yolonet to get bounding boxes and predictions
  results = yolo_predictor(img)
  if len(results) > 0:
    # if yolo has found some objects in the image, we crop the
    # original image using each of the bounding boxes returned by
    # yolo and then pass it to shufflenet. this will give us two
    # difference sources to make our prediction on, and will allow
    # a wider range of objects (namely animals) to be detected due
    # to the shufflenet using the imagenet dataset (1001 classes vs 92).
    threads = []
    for result in results:
      cropped = Image.fromarray(result.bbox.crop(np.asarray(img)))
      t = CustomThread(target=shufflenet_predictor, args=(cropped,))
      t.start()
      threads += [t]

    outputs = [t.join() for t in threads]
    results = list(zip(results, outputs))
  else:
    # if no targets were found run both mobilenet and shufflenet
    # on the entire image to hopefully catch any large features.
    # we run on both nets here to improve regognition chance and
    # so we can cross-reference the results for increased accuracy
    results = [run_broad_pass(img)]

  # -------------
  end = timer()

  for pair in results:
    print(pair)

  print(f'Inference took {end - start} seconds')
  return results
