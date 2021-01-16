module Query
  # Extends the JsonBuilder class to add builder functions
  # specifically for building elasticsearch queries.
  class QueryBuilder < Json::JsonBuilder
    def initialize(scope: nil, &block)
      super(scope: scope, &block)
    end

    def field(key)
      property "field", key
    end

    def boost(value)
      property "boost", value
    end

    def term(field, value)
      property "term" do
        property field, value
      end
    end

    def match_field(key, value, opts = {})
      property "match" do
        property key do
          property "query", value
          maybe(opts, :operator) { |op| property "operator", op }
        end
      end
    end

    def match_all
      property "match_all", {}
    end

    def match_none
      property "match_none", {}
    end

    def match_field_multi(field, items)
      bool do
        should do
          items.each do |item|
            element do
              property "match" do
                property field, item
              end
            end
          end
        end
      end
    end


    # scopes

    def weighted(score, &block)
      property "constant_score" do
        property "filter", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
        boost score
      end
    end

    def functions(&block)
      property "functions", QueryBuilder.new(scope: Json::Scope::ARRAY, &block).build
    end

    def filter(&block)
      property "filter", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def terms(&block)
      property "terms", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def query(&block)
      property "query", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def aggs(&block)
      property "aggs", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def collapse(&block)
      property "collapse", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def match(&block)
      property "match", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def bool(&block)
      property "bool", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    def should(&block)
      property "should", QueryBuilder.new(scope: Json::Scope::ARRAY, &block).build
    end

    def must(&block)
      property "should", QueryBuilder.new(scope: Json::Scope::OBJECT, &block).build
    end

    private

    def maybe(options, key)
      return unless block_given?
      yield if options.key?(key)
    end
  end

  def self.query(&block)
    return Json.wrap_result(root, nil) unless block_given?
    result = QueryBuilder.new(&block).build
    Json.wrap_result(nil, result)
  end
end
