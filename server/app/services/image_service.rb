DEFAULT_PAGE_SIZE = 20

module ImageService
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
    objs = files.map do |file|
      id = SecureRandom.alphanumeric($id_length)
      file_name = file.original_filename
      data = file.read
      save_image(id, File.extname(file_name), data)

      {
        id: id,
        data: data,
        file_name: file_name,
        file_size: file.size,
        mime_type: file.content_type,
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
