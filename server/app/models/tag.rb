require "elasticsearch/model"

class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :image

  after_destroy :update_index
  validates_uniqueness_of :value, scope: :kind

  settings number_of_shards: 1 do
    mapping dynamic: false do
      indexes :image, type: :text
      indexes :kind, type: :text
      indexes :value, type: :text, analyzer: "english"
      indexes :count, type: :integer
    end
  end

  # callbacks
  after_initialize :default_values

  # @return [String]
  def as_json(_options = nil)
    value
  end

  # @return [Hash]
  def as_indexed_json(_options = nil)
    {
      image: image.id,
      kind: kind,
      value: value,
      count: count
    }
  end

  private

  def default_values
    self.count ||= nil
  end

  def update_index
    # __elasticsearch__.
  end
end

Tag.__elasticsearch__.create_index!
Tag.import
