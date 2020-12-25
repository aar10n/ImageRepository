require "elasticsearch/model"

# Represents a image tag containing information.
# The tag +kind+ indicates whether the tag was
# provided by the user, relates to the content of
# the image or relates to text discovered in the
# image.
class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  belongs_to :image
end

Tag.__elasticsearch__.create_index!
Tag.import
