SHORTLINK_LENGTH = 7 # shorturl length

module ImageServices
  class UploadMetadata

    # @param id [String]
    # @param data [Hash]
    # @param is_batch [Boolean]
    def initialize(id: nil, data: nil, is_batch: nil)
      @id = id
      @data = data
      @is_batch = is_batch
    end

    # Updates the +Image+ records with the provided metadata, and sets
    # their status to published. All previous +Upload+ records are
    # invalidated.
    # @return [Array] An array of image_id => image url objects
    def call
      uploads = find_uploads

      uploads.zip(@data).map do |upload, data|
        next if upload.nil?

        image = Image.find_by(id: upload.attributes["image_id"])
        raise HttpError, 404 if image.nil?

        if data.key?(:tags)
          data[:tags].each do |value|
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
          title: data.fetch(:title, nil),
          description: data.fetch(:description, nil),
          private: data.fetch(:private, false),
          uploaded: true,
          shortlink: shortlink
        }
        image.update(params)

        {image.id => shortlink}
      end
    end

    private

    # Locates all pending upload records that are not expired and
    # match the image id or batch id (depending on what was given).
    # @return [Array<Upload>] An array of +Upload+ matching the criteria.
    def find_uploads
      uploads =
        if @is_batch
          Upload.where(batch_id: @id, completed: false)
        else
          Upload.where(image_id: @id, completed: false).limit(1)
        end

      raise HttpError, 404 if uploads.empty?

      now = Time.now
      # filter out expired uploads
      valid = uploads.select { |r| r.expires > now }
      raise HttpError, 410 unless uploads.length == valid.length

      Array(uploads)
    end
  end
end
