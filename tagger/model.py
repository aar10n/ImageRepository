from typing import Any
import torch


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
