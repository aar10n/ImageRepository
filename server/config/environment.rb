# Load the Rails application.
require_relative "application"

ENV["IMAGE_DIR"] = "../data/images"
ENV["ID_LENGTH"] = "7"
ENV["SECRET_LENGTH"] = "10"
ENV["PUBLISH_DELAY"] = "60"

# Initialize the Rails application.
Rails.application.initialize!
