require "elasticsearch/model"

##
# Represents a image tag containing information.
class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  belongs_to :image
end

Tag.__elasticsearch__.create_index!
Tag.import
