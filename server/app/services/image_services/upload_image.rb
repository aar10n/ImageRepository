UPLOAD_TTL = 10 * 60 * 60 # 10 hours

module ImageServices
  class UploadImage
    # @param files [Array<ActionDispatch::Http::UploadedFile>]
    def initialize(files)
      @expiry_base = Time.now
      @files = files.map do |file|
        {
          data: file.read,
          file_name: file.original_filename,
          file_size: file.size,
          mime_type: file.content_type
        }
      end
    end

    def call
      batch_id = SecureRandom.uuid

      # for each UploadedFile object create a new
      # Image and Upload instance, and save them
      # into the database.
      uploaded = @files.map do |file|
        image = Image.new(file)
        image.save!

        upload = Upload.new(upload_params(batch_id, image.id))
        upload.save!

        image.id
      end

      # if only one image was uploaded the metadata
      # can be patched using the image's id directly.
      # otherwise the batch id is used.
      url = if uploaded.length > 1
              "?batch_id=#{batch_id}"
            else
              "/#{uploaded[0]}"
            end

      "/api/images#{url}"
    end

    private

    def upload_params(batch_id, image_id)
      {
        batch_id: batch_id,
        image_id: image_id,
        url: "/api/images/#{image_id}",
        expires: @expiry_base + UPLOAD_TTL
      }
    end
  end
end
