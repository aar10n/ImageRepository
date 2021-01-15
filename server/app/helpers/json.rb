module Json
  module Scope
    ROOT = "root"
    OBJECT = "object"
    ARRAY = "array"
  end

  class JsonBuilder
    def initialize(scope: nil, &block)
      @builders = []
      @scope = Scope::ROOT
      @value = nil

      init_scope(scope) unless scope.nil?
      instance_eval(&block)
    end

    def build
      @value
    end

    # builder functions

    # Defines a property of an object
    # @param key [String, Symbol]
    # @param value [Any]
    def property(key, value = nil, &block)
      key = unwrap(key)
      value = unwrap(value)
      assert_scope Scope::OBJECT
      assert_type key, String, Symbol
      value = block_given? ? JsonBuilder.new(&block).build : value
      @value[key] = value
    end

    # Defines an element of an array
    # @param value [Any]
    def element(value = nil, &block)
      value = unwrap(value)
      assert_scope Scope::ARRAY
      value = block_given? ? JsonBuilder.new(&block).build : value
      @value << value
    end

    # Merges an object with the current scope.
    # @param obj [Hash]
    # @param deep [Boolean] deep merge
    def merge(obj, deep: false)
      obj = unwrap(obj)
      assert_scope Scope::OBJECT
      assert_type obj, Hash
      if deep
        @value.deep_merge obj
      else
        @value.merge unwrap(obj)
      end
    end

    # Joins an array to the current scope.
    # @param arr [Array]
    # @param unique [Boolean] unique join
    def concat(arr, unique: false)
      arr = unwrap(arr)
      assert_scope Scope::ARRAY
      assert_type arr, Array
      if unique
        @value |= arr
      else
        @value + arr
      end
    end

    # scopes

    # creates a new object
    def object(&block)
      return {} unless block_given?
      JsonBuilder.new(scope: Scope::OBJECT, &block).build
    end

    # creates a new array
    def array(&block)
      return [] unless block_given?
      JsonBuilder.new(scope: Scope::ARRAY, &block).build
    end

    private

    def assert_scope(scope)
      init_scope(scope) if @scope == Scope::ROOT
      return if scope == @scope
      Rails.logger.error "Expected scope to be '#{scope}' but got '#{@scope}'"
      raise JSON::ParserError
    end

    def assert_type(arg, *types)
      types = types.flatten
      return if types.empty?
      return if types.map { |t| arg.is_a? t }.any?

      msg =
        if types.length == 1
          "Expected argument of type #{types[0]} but got #{arg.class}"
        else
          "Expected argument of type #{types} but got #{arg.class}"
        end

      Rails.logger.error msg
      raise ArgumentError
    end

    def init_scope(scope)
      raise ArgumentError unless scope.in? [Scope::OBJECT, Scope::ARRAY]
      @scope = scope
      @value = scope == Scope::OBJECT ? {} : []
    end

    def unwrap(value)
      return value.call if value.is_a? Proc
      value
    end
  end

  # Creates a new json-like object from the given block.
  # This will either return a hash or an array.
  # @param root [String, Symbol, Array<String, Symbol>]
  #   Wrap the result in the given root key(s).
  # @return [Hash, Array]
  def self.json(root: nil, &block)
    wrap_result = proc do |obj|
      return obj if root.nil?
      return [obj] if root.is_a? Array and root.empty?
      root = [root] unless root.is_a? Array
      root.reverse.inject(obj) { |a, n| { n => a } }
    end

    return wrap_result.call(nil) unless block_given?
    result = JsonBuilder.new(&block).build
    wrap_result.call(result)
  end
end
