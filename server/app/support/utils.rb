ANY = proc { true }

module Utils
  # Creates a new validator from the block.
  # @return [Proc] A validator function that takes an object
  #                and returns true or false.
  def self.validator(&block)
    ValidatorBuilder.new(&block).build
  end

  # A builder class that constructs an object validator function
  # from a DSL like syntax.
  class ValidatorBuilder
    attr_accessor :keys, :validators

    # @param parent [ValidatorBuilder]
    # @param options [Hash{Symbol => Any}]
    def initialize(parent = nil, options = {}, &block)
      @validators = []
      @keys = []
      @options = options
      @parent = parent

      @options[:optional] ||= false
      instance_eval(&block)
    end

    # @return [Proc] The validator function.
    def build
      ->(obj) { @validators.map { |v| v.call(obj) }.all? }
    end

    # base conditions

    # Asserts that the object being validated is some type.
    # @param type [Class] The expected type of the object.
    # @param optional [Boolean] Whether condition is optional.
    def is(type, optional: false, &block)
      v =
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          @keys << val.keys
          val.build
        else
          wrap(type)
        end

      @validators << lambda do |o|
        v.call(o) or optional
      end
    end

    # Asserts that the object has the given +key+ as well as
    # the type of the value pointed to by the key.
    # @param key [String, Symbol] The expected key.
    # @param is [Type] The type of the key's value (optional)
    # @param optional [Boolean] Whether condition is optional.
    def key(key, is: ANY, optional: false, &block)
      opt = @options[:optional] || optional
      v = block_given? ? ValidatorBuilder.new(self, @options, &block).build : wrap(is)
      @keys << key
      @parent.keys << key unless @parent.nil?
      @validators << lambda do |o|
        o.is_a? Hash and ((o.key?(key) and v.call(o[key])) or opt)
      end
    end

    # Asserts that the object has the given length +n+.
    # @param n [Integer] The expected length.
    # @param operator [Symbol] The operator to use in the check. (default = ":==")
    def length(n, operator: :==)
      allowed = %i[== < > <= >= !=]
      op = operator.in?(allowed) ? operator : :==

      @validators << lambda do |o|
        o.respond_to?(:length) and o.length.send(op, n)
      end
    end

    # block types

    # Inverts the conditions defined in enclosing scope.
    def none(&block)
      @validators <<
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          ->(obj) { val.validators.map { |v| v.call(obj) }.none? }
        else
          ANY
        end
    end

    # Asserts that one or more of the conditions defined in
    # the enclosing scope are true.
    def any(&block)
      @validators <<
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.any? }
        else
          ANY
        end
    end

    # Asserts that only one of the conditions defined in the
    # enclosing scope are true.
    def one(&block)
      @validators <<
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.one? }
        else
          ANY
        end
    end

    # Asserts that all of the conditions defined in the enclosing
    # scope are true.
    def all(&block)
      @validators <<
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.all? }
        else
          ANY
        end
    end

    # Makes all of the conditions defined in the enclosing scope optional.
    def optional(&block)
      @validators <<
        if block_given?
          opts = @options.dup
          opts[:optional] = true
          ValidatorBuilder.new(self, opts, &block).build
        else
          ANY
        end
    end

    # only the specified keys can be present
    def only(&block)
      @validators <<
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          lambda do |obj|
            obj.is_a? Hash and val.validators.map { |v| v.call(obj) }.all? and
              obj.symbolize_keys.keys.map { |k| k.in?(val.keys) }.all?
          end
        else
          ANY
        end
    end

    # other matchers

    # Defines the type of the array holding some type. This
    # is to be used in the type parameter of the +is+ or +key+
    # functions.
    # @param of [Class, Proc] The expected contents of the array.
    def array(of: ANY)
      v = wrap(of)
      lambda do |o|
        o.is_a? Array and o.map { |e| v.call(e) }.all?
      end
    end

    # Defines a union of types. This is to be used in the type
    # parameter of the +is+ or +key+ functions and causes any
    # of the specified types to be matched.
    # @param types [Array<Class>] The possible types.
    def union(*types)
      tm = types.map { |t| wrap(t) }
      ->(o) { tm.map { |t| t.call(o) }.any? }
    end

    private

    def wrap(arg)
      if arg.is_a? Proc
        arg
      else
        lambda do |o|
          o.is_a? arg
        end
      end
    end
  end
end
