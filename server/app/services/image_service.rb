DEFAULT_PAGE_SIZE = 20

RESIZER_URL = "http://localhost/api/resizer"

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

  # @param data [String]
  def self.get_dimensions(data)
    image_size = ImageSize.new(data)
    w = image_size.width
    h = image_size.height

    wh = w / h
    hw = h / w
    diff = (wh - hw).abs

    obj = { width: w, height: h, tags: [] }
    if diff <= 0.1
      obj.merge(orientation: "square")
    elsif w > h
      obj.merge(orientation: "landscape")
    else
      obj.merge(orientation: "portrait")
    end
  end

  # @param files [Array<ActionDispatch::Http::UploadedFile>]
  # @return [Array<Image>]
  def self.upload_images(files)
    threads =
      files.map do |file|
        Thread.new {
          id = SecureRandom.alphanumeric($id_length)
          file_name = file.original_filename
          data = file.read
          path = save_image(id, File.extname(file_name), data)

          obj = {
            id: id,
            data: data,
            path: path,
            file_name: file_name,
            file_size: file.size,
            mime_type: file.content_type,
          }

          # get the image width, height, orientation and tags
          begin
            extra = TagService.tag_image(file.original_filename.to_s, data)
          rescue HttpError => e
            Rails.logger.error "Failed to tag image - status code #{e.code}"
            Rails.logger.info ">> Falling back"

            # fallback to the image_size gem to find the width
            # height and orientation of the image. No tags this
            # way unfortunately.
            extra = get_dimensions(data)
          end

          Thread.current[:obj] = obj.merge(extra)
        }
      end

    objs = threads.map do |t|
      t.join
      t[:obj]
    end

    # curb tries to send this as a multipart form-data request without
    # the explicit headers/json serialization
    paths = objs.map { |obj| obj[:path] }
    Curl.post("http://localhost/api/resizer", paths.to_json) do |request|
      request.headers["Content-Type"] = "application/json"
    end

    images = Image.create(objs.map { |obj| obj.without(:data, :path, :tags) })
    images.zip(objs).each do |image, obj|
      image.tags.create(obj[:tags]) unless obj[:tags].empty?
    end

    images
  end
end
