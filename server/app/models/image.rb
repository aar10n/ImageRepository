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
      url: url,
      secret: secret,
      tags: keywords.as_json,
      created_at: created_at,
      updated_at: updated_at
    }

    options[:with_secret] ? json : json.without(:secret)
  end

  private

  def create_tags
    puts ">>> tags: #{tags}"
  end

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
