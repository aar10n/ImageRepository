from typing import Any

import torch
import numpy as np
from torchvision.transforms import transforms
from timeit import default_timer as timer
import torch.nn.functional as nnf
from common import CustomThread
from imagenet import labels
from PIL import Image


def load_yolo() -> Any:
  model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
  # model.eval()
  return model


def load_mobilenet() -> Any:
  model = torch.hub.load('pytorch/vision:v0.6.0', 'mobilenet_v2', pretrained=True)
  model.eval()
  return model


def load_shufflenet() -> Any:
  model = torch.hub.load('pytorch/vision:v0.6.0', 'shufflenet_v2_x1_0', pretrained=True)
  model.eval()
  return model


yolo = load_yolo()
mobilenet = load_mobilenet()
shufflenet = load_shufflenet()

preprocess = transforms.Compose([
  transforms.Resize(256),
  transforms.ToTensor(),
  transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def yolo_predict(img: Image):
  start = timer()
  output = yolo([img], size=640)
  end = timer()

  print(f'Yolo inference took {end - start} seconds')
  print(output)
  output.print()
  output.show()

  for *box, conf, cls in output.pred[0]:
    print(box, conf, cls)
  return []


def mobilenet_predict(img: Image):
  tensor = preprocess(img)
  tensor = tensor.unsqueeze(0)

  with torch.no_grad():
    start = timer()
    output = mobilenet(tensor)
    end = timer()

  print(f'Mobilenet inference took {end - start} seconds')

  values, indices = torch.topk(nnf.softmax(output[0], dim=0), 5)
  names = list(zip(map(lambda i: labels[i], indices), values))
  print(names)
  return []


def shufflenet_predict(img: Image):
  tensor = preprocess(img)
  tensor = tensor.unsqueeze(0)

  with torch.no_grad():
    start = timer()
    output = shufflenet(tensor)
    end = timer()

  print(f'Shufflenet inference took {end - start} seconds')

  values, indices = torch.topk(nnf.softmax(output[0], dim=0), 5)
  names = list(zip(map(lambda i: labels[i], indices), values))
  print(names)
  return []


def run_recog(img: np.ndarray):
  img = Image.fromarray(img[:, :, ::-1])

  start = timer()
  # -------------
  t1 = CustomThread(target=yolo_predict, args=(img,))
  t2 = CustomThread(target=mobilenet_predict, args=(img,))
  t3 = CustomThread(target=shufflenet_predict, args=(img,))
  t1.start()
  t2.start()
  t3.start()

  out1 = t1.join()
  out2 = t2.join()
  out3 = t3.join()
  # -------------
  end = timer()

  print(f'Inference took {end - start} seconds')
  print('out2 =', out1)
  print('out1 =', out2)
  print('out3 =', out3)
