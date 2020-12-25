SHORTLINK_LENGTH = 7 # shorturl length

module ImageServices
  class UploadMetadata
    def initialize(params)
      @id = params[:id]
      @data = params[:data]
      @batch = params[:batch]
    end

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
        { image.id => shortlink }
      end
    end

    private

    def find_uploads
      uploads =
        if @batch
          Upload.where(batch_id: @id)
        else
          Upload.where(image_id: @id).limit(1)
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
