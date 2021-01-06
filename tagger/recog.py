from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog
import numpy as np
import cv2

from timeit import default_timer as timer

# https://github.com/facebookresearch/detectron2/blob/master/configs/LVISv0.5-InstanceSegmentation/mask_rcnn_R_50_FPN_1x.yaml
# https://github.com/facebookresearch/detectron2/blob/master/configs/COCO-Detection/faster_rcnn_R_50_C4_1x.yaml
# https://github.com/facebookresearch/detectron2/blob/master/configs/LVISv0.5-InstanceSegmentation/mask_rcnn_R_50_FPN_1x.yaml

cfg = get_cfg()
# cfg.merge_from_file(model_zoo.get_config_file('COCO-Detection/faster_rcnn_R_50_C4_1x.yaml'))
# cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url('COCO-Detection/faster_rcnn_R_50_C4_1x.yaml')

cfg.merge_from_file(model_zoo.get_config_file('LVISv0.5-InstanceSegmentation/mask_rcnn_R_50_FPN_1x.yaml'))
cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url('LVISv0.5-InstanceSegmentation/mask_rcnn_R_50_FPN_1x.yaml')

cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
cfg.MODEL.RETINANET.SCORE_THRESH_TEST = 0.5
cfg.MODEL.DEVICE = 'cpu'

predictor = DefaultPredictor(cfg)


def scale_image(img: np.ndarray, scale: float) -> np.ndarray:
  h, w = tuple(map(lambda v: int(v * scale), img.shape))[:2]
  resized = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
  print(f'resized: {resized.shape}')
  return resized


def run_recog(img: np.ndarray):
  # img = scale_image(img, 0.25)
  # cv2.imwrite('resized.png', img)

  start = timer()
  outputs = predictor(img)
  end = timer()
  print(f'Inference took {end - start} seconds')

  print(outputs)
  v = Visualizer(img[:, :, ::-1], MetadataCatalog.get(cfg.DATASETS.TRAIN[0]), scale=1.2)
  v = v.draw_instance_predictions(outputs['instances'].to('cpu'))
  cv2.imwrite('out.png', v.get_image()[:, :, ::-1])

  metadata = MetadataCatalog.get(cfg.DATASETS.TRAIN[0])
  print(f'number of classes: {len(metadata.get("thing_classes"))}')
