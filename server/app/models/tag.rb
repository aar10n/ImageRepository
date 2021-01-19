require "elasticsearch/model"

class Tag < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :image

  # after_destroy :update_index
  validates_uniqueness_of :image_id, scope: [:kind, :value]

  # after_commit on: [:create] do
  #   __elasticsearch__.index_document unless image.private
  # end
  #
  # after_commit on: [:update] do
  #   if image.private
  #     __elasticsearch__.delete_document
  #   else
  #     __elasticsearch__.update_document
  #   end
  # end
  #
  # after_commit on: [:destroy] do
  #   __elasticsearch__.delete_document if image.private
  # end

  # settings number_of_shards: 1 do
  #   mapping dynamic: false do
  #     indexes :image, type: :keyword
  #     indexes :kind, type: :text
  #     indexes :value, type: :text, analyzer: "english"
  #     indexes :count, type: :integer
  #   end
  # end

  # callbacks
  after_initialize :default_values

  def as_json(options = nil)
    if options and options[:full]
      {
        kind: kind,
        value: value,
        count: count
      }
    else
      value
    end
  end

  # @return [Hash]
  def as_indexed_json(_options = nil)
    {
      kind: kind,
      value: value,
      count: count
    }
  end

  private

  def default_values
    self.count ||= nil
  end

  # def update_index
  #   __elasticsearch__.delete_document
  # end
end

# Tag.__elasticsearch__.create_index!
# Tag.__elasticsearch__.import force: true
# Tag.__elasticsearch__.refresh_index!
