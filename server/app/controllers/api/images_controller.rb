# require "support/utils"

module Api
  class ImagesController < ApplicationController
    # GET /images
    def index
      puts "index"
    end

    # GET /images/:id
    def show
      puts "show", params
    end

    # PUT /images(/:id)
    # Completes an image upload by suppliying the missing
    # metdata for one or more previously created images.
    def update
      puts "update", params

      key, data = validate_update_params!
      images = ImageServices::UploadMetadata.new(
        params[key].to_s,
        data: data,
        is_batch: key == :batch_id
      ).call

      # unwrap the array for the single item case
      images = images[0] if key == :id

      render status: 200, json: images
    end

    # PATCH /images/:id
    # Modify the metadata of an image.
    def edit

    end

    # DELETE /images/:id
    def destroy
      puts "destroy", params
    end

    # POST /images
    # Create a new image resource from the given image(s).
    # This is the first phase of the upload process and it
    # returns a url to which a PUT request will fill in the
    # needed image metadata to complete the upload.
    def create
      puts "create", params

      files = validate_create_params!
      url = ImageServices::UploadImage.new(files).call
      response.location = url
      render status: 201, json: { url: url }
    end

    private

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
      raise HttpError, 415 unless obj.content_type.split("/")[0] == "image"
    end

    def validate_image_array!(obj)
      raise HttpError, 400 unless obj.is_a? Array
      obj.each { |o| validate_image!(o) }
    end

    # helpers

    def symbolize(obj)
      if obj.is_a? Array
        obj.map { |e| symbolize(e) }
      elsif obj.is_a? Hash
        obj.symbolize_keys
      else
        raise RuntimeError
      end
    end
  end
end
