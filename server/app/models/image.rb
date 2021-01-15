class Image < ApplicationRecord
  self.implicit_order_column = :created_at
  has_many :tags, dependent: :delete_all

  # callbacks
  after_initialize :default_values
  after_destroy :delete_file

  # @return [Array<Tag>]
  def keywords
    tags.where(kind: %w[keyword feature]).to_a
  end

  # @return [Image]
  def as_model
    self
  end

  # @return [Hash]
  def as_json(options = nil)
    options[:with_secret] ||= false
    json = {
      id: shortlink,
      name: file_name,
      type: mime_type,
      size: file_size,
      width: width,
      height: height,
      orientation: orientation,
      title: title,
      description: description,
      private: private,
      secret: secret,
      tags: keywords.as_json,
      created_at: created_at,
      updated_at: updated_at
    }

    if options[:with_secret]
      json
    else
      json.without(:secret)
    end
  end

  private

  def default_values
    self.width ||= nil
    self.height ||= nil
    self.orientation ||= nil
    self.title ||= nil
    self.description ||= nil
    self.private ||= false
  end

  def delete_file
    name = shortlink + File.extname(file_name)
    path = File.join($image_dir, name)
    File.delete(path)
  end
end
