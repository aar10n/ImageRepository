ALLOWED_ORIENTATIONS = %w[portrait landscape square]
ALLOWED_COLORS = %w[
  grayscale red orange amber
  yellow lime green teal turquoise
  aqua azure blue purple orchid magenta
]

module Api
  class SearchController < ApplicationController
    # GET /api/search
    def index
      options = validate_search!
      results = SearchService.build_query("", options)
      render status: 200, json: results
    end

    # GET /api/search/:query
    #
    # Parameters:
    #   page        | number  | The page of images to get
    #   page_size   | number  | The number of images per page
    #   color       | string  | Filter by a particular color theme.
    #   people      | boolean | Filter for images with people.
    #   num_people  | number  | Specify the number of people the look for.
    #   min_height  | number  | Minimum image width in pixels
    #   min_width   | number  | Minimum image height in pixels
    #   orientation | string  | Filter by image orientation:
    #                             "portrait", "landscape" or "square"
    def show
      options = validate_search!
      text = CGI.unescape(params[:query])
      results = SearchService.build_query(text, options)
      render status: 200, json: results.as_json
    end

    private

    #
    # Validation Methods
    #

    # search parameter validation
    def validate_search!
      to_bool = proc do |obj|
        obj.nil? ? nil : obj.to_b
      end

      valid_params = Validation.validator do
        optional do
          key :page, is: integer?
          key :page_size, is: integer?
          key :color, is: in?(ALLOWED_COLORS)
          key :people, is: boolean?
          key :num_people, is: integer?
          key :min_height, is: integer?
          key :min_width, is: integer?
          key :orientation, is: in?(ALLOWED_ORIENTATIONS)
        end
      end

      params = Utils.symbolize(request.query_parameters)

      raise HttpError, 400 unless valid_params.call(params)
      {
        page: params.fetch(:page, "1").to_i,
        page_size: params.fetch(:page_size, "20")&.to_i,
        min_height: params.fetch(:min_height, nil)&.to_i,
        min_width: params.fetch(:min_width, nil)&.to_i,
        num_people: params.fetch(:num_people, nil)&.to_i,
        people: to_bool.call(params.fetch(:people, nil)),
        color: params.fetch(:color, nil),
        orientation: params.fetch(:orientation, nil)
      }
    end
  end
end
