DEFAULT_PAGE_SIZE = 20
PUBLISH_DELAY = 60 # period before image is public (1 min)
SHORTLINK_LENGTH = 7 # shorturl length
SECRET_LENGTH = 10 # secret key length

module ImageService
  # @param page [Integer]
  # @param page_size [Integer]
  # @return [Array<Image>]
  def self.fetch_images(page, page_size: DEFAULT_PAGE_SIZE)
    offset = (page - 1) * page_size
    Image.where(private: false, published_at: Time.now...)
         .offset(offset).limit(page_size).to_a
  end

  # @param name [String]
  # @param ext [String]
  # @param data [String]
  # @return [String] The path of the saved image.
  def self.save_image(name, ext, data)
    path = File.join($image_dir, name + ext)
    f = File.new(path, "wb")
    f.write(data)
    path
  end

  # @param files [Array<ActionDispatch::Http::UploadedFile>]
  # @return [Array<Image>]
  def self.upload_images(files)
    publish_at = Time.now + PUBLISH_DELAY
    objs = files.map do |file|
      data = file.read
      shortlink = SecureRandom.alphanumeric(SHORTLINK_LENGTH)
      secret = SecureRandom.hex(SECRET_LENGTH)
      file_name = file.original_filename
      save_image(shortlink, File.extname(file_name), data)

      {
        data: data,
        shortlink: shortlink,
        secret: secret,
        file_name: file_name,
        file_size: file.size,
        mime_type: file.content_type,
        published_at: publish_at
      }
    end

    images = Image.create(objs.map { |obj| obj.without(:data) })
    if TagService.online?
      images.zip(objs).map do |image, obj|
        TagService.tag_image(image, obj[:data])
      end
    end

    images
  end

  # Updates
  def self.update_images(metadata); end
end
