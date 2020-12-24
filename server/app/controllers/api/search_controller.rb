module Api
  class SearchController < ApplicationController
    # GET /search
    def index
      puts "index"
    end

    # GET /search/:id
    def show
      puts "show", params
    end
  end
end
