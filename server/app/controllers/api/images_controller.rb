# require "support/utils"

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
      page, page_size = validate_index_params!
      images = ImageServices::FetchImages.new(page, page_size).call
      puts ">> images"
      puts images

      render status: 200, json: images
    end

    # == GET
    # Returns a single image.
    #
    # == Query Parameters:
    #   metadata_only - only
    def show
      puts "show", params
    end

    # == PUT
    # Completes an image upload by suppliying the missing
    # metdata for one or more previously created images.
    #
    # == Query Parameters:
    #   batch_id - specifies a batch of images to update.
    #              an image id cannot also be provided if
    #              batch_id is given.
    def update
      key, data = validate_update_params!
      images = ImageServices::UploadMetadata.new(
        params[key].to_s,
        metadata: data,
        is_batch: key == :batch_id
      ).call

      # unwrap the array for the single item case
      images = images[0] if key == :id
      render status: 200, json: images
    end

    # == PATCH
    # Modifies the metadata of an uploaded image.
    def edit

    end

    # == DELETE
    def destroy
      puts "destroy", params
    end

    # == POST
    # Create a new image resource from the given image(s).
    # This is the first phase of the upload process and it
    # returns a url to which a PUT request will fill in the
    # needed image metadata to complete the upload.
    def create
      puts "create", params

      files = validate_create_params!
      url = ImageServices::UploadImages.new(files).call
      response.location = url
      render status: 201, json: { url: url }
    end

    private

    #
    # Validation Methods
    #

    # index parameter validation
    def validate_index_params!
      valid_params = Utils.validator do
        optional do
          key :page, is: ->(s) { s.is_i? } # integer string?
          key :page_size, is: proc { |s| s.is_i? } # integer string?
        end
      end

      options = request.query_parameters
      raise 400 unless  valid_params.call(options)

      [options[:page]&.to_i(10), options[:page_size]&.to_i(10)]
    end

    # update parameter validation
    def validate_update_params!
      keys = %i[id batch_id].filter { |s| params.key?(s) }
      raise HttpError, 400 unless keys.length == 1

      data = symbolize JSON.parse(request.body.read)

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
            key :title, is: String
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

    # helpers

    def symbolize(obj)
      case obj
      when Array
        obj.map { |e| symbolize(e) }
      when Hash
        obj.symbolize_keys
      else
        raise RuntimeError
      end
    end
  end
end
