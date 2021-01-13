DEFAULT_PAGE_SIZE = 20
UPLOAD_TTL = 10 * 60 * 60 # 10 hours
SHORTLINK_LENGTH = 7 # shorturl length

module ImageService
  # Fetches images from the database.
  # @param page [Integer]
  # @param page_size [Integer]
  def self.fetch_images(page, page_size: DEFAULT_PAGE_SIZE)
    offset = (page - 1) * page_size
    Image.offset(offset).limit(page_size)
  end

  # Saves an image to disk.
  # @param image [Image]
  # @param data [String]
  # @return [String] The name of the saved file.
  def self.save_image(image, data)
    name = image.shortlink + File.extname(image.file_name)
    path = File.join($image_dir, name)
    file = File.new(path, "wb")
    file.write(data)
    name
  end

  # Creates new +Image+ and +Upload+ records from the given image file.
  # Until the upload process is completed by a second PUT request to the
  # returned url, the image isn't considered published and cannot be accessed.
  # @param files [Array<ActionDispatch::Http::UploadedFile>]
  # @return [Array] The location of the resource(s) and an array of suggested
  # tags for each image.
  def self.upload_images(files)
    expiry_base = Time.now
    batch_id = SecureRandom.uuid
    files = files.map do |file|
      {
        data: file.read,
        file_name: file.original_filename,
        file_size: file.size,
        mime_type: file.content_type
      }
    end


    images = Image.create(files.map { |file| file.reject { |k| k == :data} })
    uploads = Upload.create(
      files.each_with_index.map do |file, i|
        image = images[i]
        {
          image_id: image.id,
          batch_id: batch_id,
          data: file[:data],
          url: "/api/images/#{image.id}",
          expires: expiry_base + UPLOAD_TTL
        }
      end
    )

    tags =
      if TagService.tagger_online?
        uploads.map do |upload|
          TagService.tag_image(upload.image.as_model, upload.data)
        end
      else
        []
      end

    # if only one image was uploaded the metadata
    # can be patched using the image's id directly.
    # otherwise the batch id is used.
    url = if files.length > 1
            "?batch_id=#{batch_id}"
          else
            "/#{images[0].id}"
          end

    ["/api/images#{url}", tags]
  end

  # Updates the +Image+ records with the provided metadata, and sets
  # their status to published. This also saves the uploaded images data
  # onto disk at the path given by the +IMAGES_DIR+ environment variable.
  # Finally, all previous +Upload+ records are invalidated.
  # @param id [String]
  # @param metadata [Array<Any>]
  # @param is_batch [TrueClass, FalseClass]
  # @return [Array] An array of image_id to image url objects
  def self.upload_metadata(id, metadata, is_batch: false)
    metadata_enum = metadata.each
    uploads =
      if is_batch
        Upload.where(batch_id: id)
      else
        Upload.where(image_id: id)
      end

    raise HttpError, 404 if uploads.empty?
    now = Time.now
    # filter out expired uploads
    valid = uploads.select { |r| r.expires > now }
    raise HttpError, 410 unless uploads.length == valid.length

    uploads.map do |upload|
      meta = metadata_enum.next
      image = upload.image
      upload.completed = false

      TagService.add_keywords(image.as_model, meta.key?(:tags) ? meta[:tags] : [])
      shortlink = SecureRandom.alphanumeric(SHORTLINK_LENGTH)

      params = {
        description: meta.fetch(:description, nil),
        private: meta.fetch(:private, false),
        published: true,
        shortlink: shortlink
      }
      image.update(params)

      name = ImageService.save_image(image.as_model, upload[:data])
      upload.destroy

      {image.id => name}
    end
  end
end
