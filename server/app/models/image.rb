class Image < ApplicationRecord
  has_many :tags, dependent: :destroy
  self.implicit_order_column = :created_at
  default_scope { order(created_at: :desc) }

  # callbacks
  after_initialize :default_values
  before_destroy :delete_file

  # @return [String]
  def url
    File.join($base_url, "/images/#{id}#{File.extname(file_name)}")
  end

  # @return [String]
  def thumbnail_url
    File.join($base_url, "/images/thumbnails/#{id}#{File.extname(file_name)}")
  end

  # @return [Array<Tag>]
  def keywords
    tags.where(kind: "keyword").to_a
  end

  # @return [Image]
  def as_model
    self
  end

  # @return [Hash]
  def as_json(options = nil)
    options[:with_secret] ||= false
    options[:thumbnails] ||= false

    json = {
      id: id,
      name: file_name,
      type: mime_type,
      size: file_size,
      width: width,
      height: height,
      orientation: orientation,
      title: title,
      description: description,
      private: private,
      url: options[:thumbnails] ? thumbnail_url : url,
      secret: secret,
      tags: options[:thumbnails] ? [] : keywords.as_json,
      created_at: created_at,
      updated_at: updated_at
    }

    if options[:thumbnails]
      json.with(:id, :width, :height, :orientation, :url)
    elsif !options[:with_secret]
      json.without(:secret)
    else
      json
    end
  end

  private

  def default_values
    self.id ||= SecureRandom.alphanumeric($id_length)
    self.width ||= nil
    self.height ||= nil
    self.orientation ||= nil
    self.title ||= nil
    self.description ||= nil
    self.private ||= false
    self.published_at ||= Time.now + $publish_delay
    self.secret ||= SecureRandom.hex($secret_length)
  end

  def delete_file
    name = id + File.extname(file_name)
    path = File.join($image_dir, name)
    File.delete(path)
  end
end
