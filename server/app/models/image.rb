# Represents an uploaded image.
class Image < ApplicationRecord
  include ActiveModel::Serialization

  self.implicit_order_column = :created_at
  has_many :tags

  after_initialize :default_values
  def default_values
    self.width ||= -1
    self.height ||= -1
    self.orientation ||= nil
    self.shortlink ||= nil
    self.description ||= nil
    self.private ||= false
    self.published ||= false
  end

  def as_json(options = nil)
    puts ">>> calling `as_json`"
    result = super(options)
    puts ">>> result"
    puts result.keys

    result
  end

  def serializable_hash(options = nil)
    super
  end
end
