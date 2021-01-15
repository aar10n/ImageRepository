ALLOWED_MIME_TYPES = %w[image/gif image/jpeg image/png image/webp]

module Api
  class ImagesController < ApplicationController
    include Authenticated
    authorize :update, :destroy

    # GET /api/images
    #
    # Parameters:
    #   page      | number | The page of images to get
    #   page_size | number | The number of images per page
    def index
      page, page_size = validate_index!
      offset = (page - 1) * page_size
      images = Image.where(private: false, published_at: ..Time.now)
                    .offset(offset).limit(page_size).to_a

      render status: 200, json: images
    end

    # POST /api/images
    #
    # Body (formdata):
    #   file | image/* | The image file
    def create
      files = validate_create!
      single = false
      unless files.is_a? Array
        single = true
        files = [files]
      end

      images = ImageService.upload_images(files)
      images = images.first if single
      render status: 201, json: images.as_json(with_secret: true)
    end

    # GET /api/images/:id
    def show
      image = Image.find(params[:id])
      render status: 200, json: image
    end

    # PATCH /api/images/:id
    #
    # Headers:
    #   Authorization | Basic Auth | 'Owner {secret key}'
    #
    # Body (json):
    #   *all are optional*
    #   title       | string   | Title of the image
    #   description | string   | Description of the image
    #   private     | boolean  | Image is accessible by url only
    #   tags        | string[] | Keywords associated with the image
    def update
      attributes = validate_update!
      Image.find(params[:id]).update(attributes)
      render status: 200
    end

    # DELETE /api/images/:id
    #
    # Headers:
    #   Authorization | Basic Auth | 'Owner {secret key}'
    def destroy
      Image.find(params[:id]).destroy
      render status: 200
    end

    private

    #
    # Validation Methods
    #

    # index parameter validation
    def validate_index!
      validator = Validation.validator do
        optional do
          key :page, is: integer?
          key :page_size, is: integer?
        end
      end

      options = request.query_parameters
      raise HttpError, 400 unless validator.call(options)

      [options[:page]&.to_i || 1, options[:page_size]&.to_i || 20]
    end

    # create parameter validation
    def validate_create!
      validator = proc do |obj|
        raise HttpError, 400 unless obj.is_a? ActionDispatch::Http::UploadedFile
        raise HttpError, 415 unless obj.content_type.in? ALLOWED_MIME_TYPES
      end

      keys = %i[file files].filter { |k| params.key?(k) }
      raise HttpError, 400 unless keys.length == 1

      if params.key?(:file)
        validator.call(params[:file])
      elsif params.key?(:files)
        raise HttpError, 400 unless obj.is_a? Array
        obj.each { |o| validator.call(o) }
      end

      params[keys[0]]
    end

    # update parameter validation
    def validate_update!
      validator = Validation.validator do
        optional do
          only do
            key :title, is: String
            key :description, is: String
            key :private, is: union?(TrueClass, FalseClass)
            key :tags, is: array?(of: String)
          end
        end
      end

      body = JSON.parse(request.raw_post)
      raise HttpError, 400 unless validator.call(body)
      body
    end
  end
end
