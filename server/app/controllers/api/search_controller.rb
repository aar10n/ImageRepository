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
      search_params = validate_search_params!
      puts search_params
      render status: 200
    end

    # GET /search/:query
    def show
      puts "show"
      puts params[:query]
      puts CGI.unescape(params[:query])
      search_params = validate_search_params!
      puts search_params
      render status: 200
    end

    private

    #
    # Validation Methods
    #

    # search parameter validation
    def validate_search_params!
      valid_params = Utils.validator do
        optional do
          key :min_height, is: integer?
          key :min_width, is: integer?
          key :num_people, is: integer?
          key :people, is: boolean?
          key :color, is: in?(ALLOWED_COLORS)
          key :orientation, is: in?(ALLOWED_ORIENTATIONS)
        end
      end

      params = Utils.symbolize(request.query_parameters)

      puts "valid = #{valid_params.call(params)}"
      raise HttpError, 400 unless valid_params.call(params)
      {
        min_height: params.fetch(:min_height, "-1").to_i,
        min_width: params.fetch(:min_width, "-1").to_i,
        num_people: params.fetch(:num_people, "-1").to_i,
        people: params.fetch(:people, nil).to_b,
        color: params.fetch(:color, nil),
        orientation: params.fetch(:orientation, nil)
      }
    end
  end
end
