class Tag < ApplicationRecord
  belongs_to :image

  # after_destroy :update_index
  validates_uniqueness_of :image_id, scope: [:kind, :value]

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
end
