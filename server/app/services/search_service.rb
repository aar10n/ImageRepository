module SearchService
  # @param text [String]
  # @param options [Hash{Symbol => Any}]
  def self.build_query(text, options)
    text = nil if text.nil? or text.empty?

    query = Query.query do
      from options[:page] - 1
      size options[:page_size]

      query do
        bool do
          must do
            element do
              shortform_query({
                "published_at" => {
                  type: "range",
                  op: "lte",
                  value: "now"
                }
              })
            end

            element do
              if text
                shortform_query({
                  "tags.*" => {
                    "tags.kind" => %w[feature keyword],
                    "tags.value" => text
                  }
                })
              else
                property "match_all", object
              end
            end

            if options[:color]
              element do
                shortform_query({
                  "tags.*" => {
                    "tags.kind" => "color",
                    "tags.value" => options[:color]
                  }
                })
              end
            end

            if options[:people]
              element do
                shortform_query({
                  "tags.*" => {
                    "tags.kind" => %w[feature],
                    "tags.value" => "person"
                  }
                })
              end
            end

            if options[:min_height]
              element do
                shortform_query({
                  "height" => {
                    type: "range",
                    op: "gte",
                    value: options[:min_height]
                  }
                })
              end
            end

            if options[:min_width]
              element do
                shortform_query({
                  "width" => {
                    type: "range",
                    op: "gte",
                    value: options[:min_width]
                  }
                })
              end
            end

            if options[:orientation]
              element do
                shortform_query({
                  "orientation" => options[:orientation]
                })
              end
            end
          end
        end
      end
    end



    response = Image.search query
    response.results.map do |result|
      src = result._source
      {
        id: src.id,
        width: src.width,
        height: src.height,
        orientation: src.orientation,
        url: src.url
      }
    end
  end
end
