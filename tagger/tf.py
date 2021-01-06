from typing import Any, Tuple, Dict

import numpy as np
import os
import sys
import pathlib
import tensorflow as tf
import cv2

from timeit import default_timer as timer

from object_detection.utils import label_map_util
from object_detection.utils import config_util
from object_detection.utils import visualization_utils as viz_utils
from object_detection.builders import model_builder
from object_detection.core.model import DetectionModel


MODEL_DIR = './models'
MODELS = {
  'centernet': 'centernet_hg104_512x512_coco17_tpu-8',
  'ssd_mobilenet_v1_640x640': 'ssd_mobilenet_v1_fpn_640x640_coco17_tpu-8',
  'ssd_mobilenet_v2_640x640': 'ssd_mobilenet_v2_fpnlite_640x640_coco17_tpu-8',
  'ssd_mobilenet_v2_320x320': 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8',
  'faster_rcnn_tpu_v1': 'faster_rcnn_resnet152_v1_1024x1024_coco17_tpu-8',
  'faster_rcnn_gpu_v1': 'faster_rcnn_resnet152_v1_800x1333_coco17_gpu-8',
}


def load_model(name: str) -> Tuple[DetectionModel, Dict[str, Any]]:
  model_name = MODELS[name]
  pipeline_config = os.path.join(MODEL_DIR, model_name, 'pipeline.config')
  tf_configs = config_util.get_configs_from_pipeline_file(pipeline_config)

  # build the model
  model_config = tf_configs['model']
  tf_model = model_builder.build(model_config=model_config, is_training=False)

  # restore from checkpoint
  check_file = os.path.join(MODEL_DIR, model_name, 'checkpoint', 'ckpt-0')
  check = tf.compat.v2.train.Checkpoint(model=tf_model)
  check.restore(check_file).expect_partial()

  # get the labels
  label_map_path = os.path.join(MODEL_DIR, model_name, 'label_map.pbtxt')
  label_map = label_map_util.load_labelmap(label_map_path)
  categories = label_map_util.convert_label_map_to_categories(
    label_map,
    max_num_classes=label_map_util.get_max_label_map_index(label_map),
    use_display_name=True
  )
  category_index = label_map_util.create_category_index(categories)
  # label_map_dict = label_map_util.get_label_map_dict(label_map, use_display_name=True)

  return tf_model, category_index


def make_detector(tf_model: DetectionModel):
  def detect_fn(img: np.ndarray):
    pre_start = timer()
    img, shapes = tf_model.preprocess(img)
    pre_end = timer()

    inf_start = timer()
    pred_dict = tf_model.predict(img, shapes)
    inf_end = timer()

    post_start = timer()
    detections = tf_model.postprocess(pred_dict, shapes)
    shapes = tf.reshape(shapes, [-1])
    post_end = timer()

    print(f'Preprocessing took: {pre_end - pre_start} seconds')
    print(f'Prediction took: {inf_end - inf_start} seconds')
    print(f'Postprocessing took: {post_end - post_start} seconds')
    return detections, pred_dict, shapes
  return detect_fn


model, index = load_model('ssd_mobilenet_v2_320x320')
detect = make_detector(model)


def scale_image(img: np.ndarray, scale: float) -> np.ndarray:
  h, w = tuple(map(lambda v: int(v * scale), img.shape))[:2]
  resized = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
  return resized


def run_recog(img: np.ndarray):
  # img = scale_image(img, 0.3)
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
  tensor = tf.convert_to_tensor(np.expand_dims(img, 0), tf.float32)

  start = timer()
  detections, pred_dict, shapes = detect(tensor)
  end = timer()

  print(f'Inference took {end - start} seconds')

  label_id_offset = 1
  print(detections['detection_boxes'][0].numpy())
  print(detections['detection_classes'][0].numpy() + label_id_offset)
  print(detections['detection_scores'][0].numpy())
  print(index)

  img_copy = img.copy()
  viz_utils.visualize_boxes_and_labels_on_image_array(
    img_copy,
    detections['detection_boxes'][0].numpy(),
    (detections['detection_classes'][0].numpy() + label_id_offset).astype(int),
    detections['detection_scores'][0].numpy(),
    index,
    use_normalized_coordinates=True,
    max_boxes_to_draw=200,
    min_score_thresh=.50,
    agnostic_mode=False,
  )

  cv2.imwrite('out.png', img_copy[:, :, ::-1])
