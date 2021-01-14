ALLOWED_MIME_TYPES = %w[image/gif image/jpeg image/png image/webp]

module Api
  class ImagesController < ApplicationController
    # == GET
    # Returns a list of images.
    #
    # == Query Parameters:
    #   page - specifies the page of results to return.
    #   page_size - specifies how many items are returned per page.
    def index
      render status: 200
      page, page_size = validate_index_params!
      images = ImageService.fetch_images(page, page_size)
      puts ">> images"
      puts images

      render status: 200, json: images
    end

    def show
      puts "show", params
    end

    def update
      key, data = validate_update_params!
      images = ImageService.upload_metadata(
        params[key].to_s,
        data,
        is_batch: key == :batch_id
      )

      # unwrap the array for the single item case
      images = images[0] if key == :id
      render status: 200, json: images
    end

    def edit; end

    def destroy
      puts "destroy", params
    end

    def create
      puts "create", params

      files = validate_create_params!
      results = ImageService.upload_images(files)
      puts ">> done uploading!"
      puts ">> results: #{results}"
      render status: 201, json: results
    end

    private

    #
    # Validation Methods
    #

    # index parameter validation
    def validate_index_params!
      valid_params = Utils.validator do
        optional do
          key :page, is: integer?
          key :page_size, is: integer?
        end
      end

      options = request.query_parameters
      raise 400 unless valid_params.call(options)

      [options[:page]&.to_i(10), options[:page_size]&.to_i(10)]
    end

    # update parameter validation
    def validate_update_params!
      keys = %i[id batch_id].filter { |s| params.key?(s) }
      raise HttpError, 400 unless keys.length == 1

      data = JSON.parse(request.body.read, symbolize_keys: true)

      if params.key?(:id)
        validate_metadata! data
        [keys[0], [data]]
      elsif params.key?(:batch_id)
        validate_metadata_array! data
        [keys[0], data]
      end
    end

    def validate_metadata!(obj)
      valid_metadata = Utils.validator do
        optional do
          only do
            key :description, is: String
            key :private, is: union(TrueClass, FalseClass)
            key :tags, is: array(of: String)
          end
        end
      end

      raise HttpError, 400 unless valid_metadata.call(obj)
    end

    def validate_metadata_array!(obj)
      raise HttpError, 400 unless obj.is_a? Array
      obj.each { |o| validate_metadata!(o) }
    end

    # create parameter validation
    def validate_create_params!
      keys = %i[file files].filter { |k| params.key?(k) }
      raise HttpError, 400 unless keys.length == 1

      if params.key?(:file)
        validate_image! params[:file]
      elsif params.key?(:files)
        validate_image_array! params[:files]
      end

      Array(params[keys[0]])
    end

    def validate_image!(obj)
      raise HttpError, 400 unless obj.is_a? ActionDispatch::Http::UploadedFile
      raise HttpError, 415 unless obj.content_type.in? ALLOWED_MIME_TYPES
    end

    def validate_image_array!(obj)
      raise HttpError, 400 unless obj.is_a? Array
      obj.each { |o| validate_image!(o) }
    end
  end
end
