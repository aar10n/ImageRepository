require "elasticsearch/model"

# Represents an information tag associated with
# an image.
class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :image

  after_initialize :default_values
  def default_values
    self.count ||= nil
  end

  settings do
    mappings dynamic: false do
      indexes :image
      indexes :value, analyzer: "english"
      indexes :count
    end
  end
end

Tag.__elasticsearch__.create_index!
Tag.import
