##
# Represents an uploaded image.
class Image < ApplicationRecord
  self.implicit_order_column = :created_at
  has_many :tags

  after_initialize :default_values
  def default_values
    self.private ||= false
    self.uploaded ||= false
    self.shortlink ||= ""
  end
end
