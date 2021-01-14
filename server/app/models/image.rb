class Image < ApplicationRecord
  self.implicit_order_column = :created_at
  has_many :tags

  after_initialize :default_values
  def default_values
    self.width ||= nil
    self.height ||= nil
    self.orientation ||= nil
    self.title ||= nil
    self.description ||= nil
    self.private ||= false
  end

  # @return [Array<Tag>]
  def keywords
    tags.where(kind: %w[keyword feature]).to_a
  end

  # @return [Image]
  def as_model
    self
  end

  # @return [Hash]
  def as_json(_options = nil)
    {
      id: shortlink,
      name: file_name,
      type: mime_type,
      size: file_size,
      width: width,
      height: height,
      orientation: orientation,
      title: title,
      description: description,
      tags: keywords.as_json,
      private: private,
      created_at: created_at,
      updated_at: updated_at
    }
  end
end
