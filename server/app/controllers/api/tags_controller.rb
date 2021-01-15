module Api
  class TagsController < ApplicationController
    include Authenticated
    authorize :create, :destroy

    # GET /api/images/:id/tags
    def index
      tags = Tag.where(image: params[:id], kind: "keyword")
      render status: 200, json: tags
    end

    # POST /api/images/:id/tags
    #
    # Body (json):
    #   string[] | The new image tags
    def create
      tags = validate_create!
      image = Image.find(params[:id])
      TagService.add_tags(image, tags)
      render status: 200
    end

    # DELETE /api/images/:id/tags/:name
    def destroy
      name = CGI.unescape(params[:name])
      puts ">> deleting '#{name}'"
      Tag.delete_by(kind: "keyword", value: name)
      render status: 200
    end

    private

    #
    # Validation Methods
    #

    # create parameter validation
    def validate_create!
      validator = Utils.validator do
        is array?(of: String)
      end

      body = JSON.parse(request.raw_post)
      raise HttpError, 400 unless validator.call(body)
      body
    end
  end
end
