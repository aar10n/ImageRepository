ALLOWED_ORIENTATIONS = %w[portrait landscape square]
ALLOWED_COLORS = %w[
  black white gray red orange amber
  yellow lime green teal turquoise
  aqua azure blue purple orchid magenta
]

module Api
  class SearchController < ApplicationController
    # GET /search
    def index
      puts "index"
      options = validate_search!
      puts options
      render status: 200
    end

    # GET /search/:query
    #
    # Parameters:
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
      SearchService.build_query(text, options)
      render status: 200
    end

    private

    #
    # Validation Methods
    #

    # search parameter validation
    def validate_search!
      to_bool = proc do |obj|
        return nil if obj.nil?
        return obj.to_b
      end

      valid_params = Validation.validator do
        optional do
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
        min_height: params.fetch(:min_height, "-1").to_i,
        min_width: params.fetch(:min_width, "-1").to_i,
        num_people: params.fetch(:num_people, "-1").to_i,
        people: to_bool.call(params.fetch(:people, nil)),
        color: params.fetch(:color, nil),
        orientation: params.fetch(:orientation, nil)
      }
    end
  end
end
