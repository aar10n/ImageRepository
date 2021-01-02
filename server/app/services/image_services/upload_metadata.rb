SHORTLINK_LENGTH = 7 # shorturl length

module ImageServices
  class UploadMetadata

    # @param id [String]
    # @param metadata [Hash]
    # @param is_batch [Boolean]
    def initialize(id, metadata: {}, is_batch: false)
      @id = id
      @metadata = metadata
      @is_batch = is_batch
    end

    # Updates the +Image+ records with the provided metadata, and sets
    # their status to published. This also saves an uploaded images data
    # onto disk at the path given by the +IMAGES_DIR+ environment variable.
    # Finally, all previous +Upload+ records are invalidated.
    # @return [Array] An array of image_id => image url objects
    def call
      uploads = find_uploads

      # How can we query for all the images based on the found uploads?
      d = @metadata.each
      uploads.map do |upload|
        metadata = d.next
        upload.completed = false

        image = Image.find_by(id: upload.attributes["image_id"], published: false)
        raise HttpError, 404 if image.nil?

        if metadata.key?(:tags)
          metadata[:tags].each do |value|
            params = {
              image_id: image.id,
              kind: "user",
              value: value
            }

            tag = Tag.new(params)
            tag.save
          end
        end

        shortlink = SecureRandom.alphanumeric(SHORTLINK_LENGTH)

        params = {
          title: metadata.fetch(:title, nil),
          description: metadata.fetch(:description, nil),
          private: metadata.fetch(:private, false),
          published: true,
          shortlink: shortlink
        }

        image.update(params)
        # save image to file
        name = ImageServices::SaveImage.new(image, upload).call
        upload.destroy

        {image.id => name}
      end
    end

    private

    # Locates all pending upload records that are not expired and
    # match the image id or batch id (depending on what was given).
    # @return [ActiveRecord::Relation<Upload>] The +Upload+ relation.
    def find_uploads
      uploads =
        if @is_batch
          Upload.where(batch_id: @id)
        else
          Upload.where(image_id: @id).limit(1)
        end

      raise HttpError, 404 if uploads.empty?

      now = Time.now
      # filter out expired uploads
      valid = uploads.select { |r| r.expires > now }
      raise HttpError, 410 unless uploads.length == valid.length

      uploads
    end

  end
end
