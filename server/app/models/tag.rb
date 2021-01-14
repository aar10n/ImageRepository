require "elasticsearch/model"

class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :image

  settings number_of_shards: 1 do
    mapping dynamic: false do
      indexes :image do
        indexes :id, type: :text
      end
      indexes :kind, type: :text
      indexes :value, type: :text, analyzer: "english"
      indexes :count, type: :integer
    end
  end

  after_initialize :default_values
  def default_values
    self.count ||= nil
  end

  # @return [String]
  def as_json(_options = nil)
    value
  end

  # @return [Hash]
  def as_indexed_json(_options = nil)
    {
      image: { id: image.id },
      kind: kind,
      value: value,
      count: count
    }
  end
end

Tag.__elasticsearch__.create_index!
Tag.import
