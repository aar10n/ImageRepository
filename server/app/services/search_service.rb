module SearchService
  # @param text [String]
  # @param options [Hash{Symbol => Any}]
  def self.build_query(text, options)
    text = " " if text.nil? or text.empty?
    puts ">> text = '#{text}'"
    # key :color, is: in?(ALLOWED_COLORS)
    # key :people, is: boolean?
    # key :num_people, is: integer?
    # key :min_height, is: integer?
    # key :min_width, is: integer?
    # key :orientation, is: in?(ALLOWED_ORIENTATIONS)

    query = Query.query do
      query do
        property "function_score" do
          query do
            match_field_multi "value", text.split(" ")
          end

          functions do
            element do
              property "field_value_factor" do
                field "count"
                property "factor", 1.1
                property "modifier", "sqrt"
                property "missing", 1
              end
            end
          end
          # property "min_score", 20
          property "boost_mode", "sum"
        end
      end

      # query do
      #   match_field_multi "value", text.split(" ")
      # end

      aggs do
        property "images" do
          terms do
            field "image"
            property "order" do
              property "total_score.sum", "desc"
            end
          end

          aggs do
            property "total_score" do
              property "stats" do
                property "script", "_score"
              end
            end
          end
        end
      end

      collapse do
        field "image"
      end
    end

    puts "query:"
    puts JSON.pretty_generate(query)
    puts ""

    response = Tag.search query
    puts ">> results:"
    puts JSON.pretty_generate(response.results.as_json)
    puts JSON.pretty_generate(response.aggregations.as_json)
  end
end
