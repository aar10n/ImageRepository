module ImageServices
  class SaveImage
    # @param image [Image]
    # @param upload [Upload]
    def initialize(image, upload)
      @image = image
      @upload = upload
    end

    # Persists an images data stored in the database to a file
    # at the path given by the +IMAGES_DIR+ environment variable.
    # The file name is the shortlink, and the extension is given
    # by the original image.
    # @return [String] The name of the saved image.
    def call
      name = @image.shortlink + File.extname(@image.file_name)
      path = File.join($image_dir, name)
      file = File.new(path, "wb")
      file.write(@upload.data)

      name
    end
  end
end
