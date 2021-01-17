### Please Don't Look Yet 

*Almost done!*


### Structure

#### Overview
```
.
├── client   # front-end
├── nginx    # nginx configuration
├── resizer  # microservice
├── scripts  # misc. scripts
├── server   # back-end
└── tagger   # microservice
```

#### Client

Front-end written in typescript using react and redux. Web design and css
is *not* my strong suit, so many aspects were inspire by Imgur and Shutterstock.

#### Resizer

A microservice written in python that generates scaled down versions of 
images for use as thumbnails. This was added to hopefully address the poor
performance in the gallery view caused by large resolution images downloaded
from unsplash.

#### Scripts

Contains miscellaneous scripts used during development. The `upload_images.py`
script makes it easy to upload an entire folder of images. Simply pass the path
to the folder of images when calling the file. Example: `upload_images.py <path>`

#### Server

This the main server and it's built with RoR configured in API only mode. It can
operate independently of the two microservices. This is my first project ever in
both Ruby and Rails so please forgive any anti-patterns or bad code.

#### Tagger

A microservice written in python that analyzes and generates tags for images using
AI. Before this project, I wanted to learn more about machine learning so I experimented
with a number of different frameworks including pytorch, tensorflow, detectron2. In the
end, the best combination of perfomance, number of classes and accuracy was acheived by
using three different pre-trained models: YOLO v5, Shufflenet v2 and Mobilenet v2. 
The multiple modles, in combination with the hand-annotated labels results in pretty
accurate tags being generated for most images.

### Setup

*Note* - Both the tagger and resizer require Python 3.8.

1. `docker-compose up`
2. `cd client && npm install && npm start`
3. `cd server && rails s`
4. `cd tagger && pip install -r requirements.txt && python main.py`
5. `cd resizer && pip install -r requirements.txt && python main.py`

The last two are technically optional but highly recommended.
