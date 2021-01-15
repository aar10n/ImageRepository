ANY = proc { true }
NONE = proc { false }

module Utils
  # @param auth [String]
  # @return [Hash]
  def self.decode_auth(auth)
    return {} if auth.nil?
    type, creds = auth.split(" ")
    user, pass = Base64.decode64(creds).split(":")
    { type: type, user: user, pass: pass }
  end

  # @param obj [Array, Hash]
  def self.symbolize(obj)
    case obj
    when Array
      obj.map { |e| Utils.symbolize(e) }
    when Hash
      obj.symbolize_keys
    else
      raise RuntimeError
    end
  end

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

      # default options
      @options[:optional] ||= false
      @options[:rescue] ||= ANY

      instance_eval(&block)
    end

    # @return [Proc] The validator function.
    def build
      lambda do |obj|
        if @validators.length.zero?
          true
        else
          @validators.map { |v| v.call(obj) }.all?
        end
      rescue => e
        raise e unless @options[:rescue].call(e)
        false
      end
    end

    #
    # Top level validators
    #

    # Asserts that the object being validated is some type.
    # @param type [Class] The expected type of the object.
    # @param value [Any] The expected value of the object (optional).
    def is(type, value: ANY, &block)
      v1 =
        if block_given?
          val = ValidatorBuilder.new(self, @options, &block)
          @keys << val.keys
          val.build
        else
          wrap(type)
        end

      v2 = wrap(value, ->(a, b) { a == b })
      @validators << proc do |o|
        v1.call(o) and v2.call(o)
      end
    end

    # Asserts that the object being validated is some value.
    def value(value)
      @validators << wrap(value, ->(a, b) { a == b })
    end

    # Asserts that the object has the given +key+ as well as
    # the type of the value pointed to by the key.
    # @param key [String, Symbol] The expected key.
    # @param is [Type] The type of the key's value (optional)
    # @param optional [Boolean] Whether condition is optional.
    def key(key, is: ANY, optional: false, &block)
      opt = @options[:optional] || optional
      v =
        if is == ANY and !optional and block_given?
          ValidatorBuilder.new(self, @options, &block).build
        else
          wrap(is)
        end

      @keys << key
      @parent.keys << key unless @parent.nil?
      @validators << proc do |o|
        o.is_a? Hash and (o.key?(key) ? v.call(o[key]) : opt)
      end
    end

    # Asserts that the object has the given length +n+.
    # @param n [Integer] The expected length.
    # @param operator [Symbol] The operator to use in the check. (default = ":==")
    def length(n, operator: :==)
      allowed = %i[== < > <= >= !=]
      op = operator.in?(allowed) ? operator : :==

      @validators << proc do |o|
        o.respond_to?(:length) and o.length.send(op, n)
      end
    end

    #
    # Scopes
    #

    # Asserts that none of the conditions defined in the
    # enclosing scope are true.
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
          opts = @options.dup
          opts[:optional] = false
          val = ValidatorBuilder.new(self, opts, &block)
          @keys << val.keys
          # ->(obj) { val.validators.map { |v| v.call(obj) }.one? }
          proc do |obj|
            val.validators.map { |v| v.call(obj) }.one?
          end
        else
          ANY
        end
    end

    # Asserts that all of the conditions defined in the enclosing
    # scope are true.
    def all(&block)
      @validators <<
        if block_given?
          opts = @options.dup
          opts[:optional] = false
          val = ValidatorBuilder.new(self, opts, &block)
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

    # Asserts that the only keys present in the hash are the ones
    # defined in the enclosing scope.
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

    # Scope that is only evaluated if the given condition is met.
    # @param cond [Any] The condition to evaluate at the current scope.
    def if?(cond, &block)
      c = wrap(cond, ->(a, b) { a == b })
      @validators <<
        if block_given?
          opts = @options.dup
          opts[:optional] = false
          proc do |o|
            if c.call(o)
              v = ValidatorBuilder.new(self, opts, &block).build
              v.call(o)
            else
              true
            end
          end
        else
          ANY
        end
    end

    #
    # Conditions
    #

    # Matches a value of the given type, and optionally value.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def is?(type, value: ANY)
      v1 = wrap(type)
      v2 = wrap(value, ->(a, b) { a == b })
      proc do |o|
        v1.call(o) and v2.call(o)
      end
    end

    # Matches a +Hash+ with the given key and optionally the
    # type/value.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def key?(key, is: ANY)
      v = wrap(is)
      proc do |o|
        o.is_a? Hash and (o.key?(key) ? v.call(o[key]) : false)
      end
    end

    # Matches a given value.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def value?(value)
      wrap(value, ->(a, b) { a == b })
    end

    # Matches an +Array+ and optionally, with the elements
    # also matching some type.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def array?(of: ANY)
      v = wrap(of)
      ->(o) { o.is_a? Array and o.map { |e| v.call(e) }.all? }
    end

    # Matches a type that is present in the given types.
    # @param types [Array<Class>] The possible types.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def union?(*types)
      tm = types.map { |t| wrap(t) }
      ->(o) { tm.map { |t| t.call(o) }.any? }
    end

    # Matches a value that is present in the given values.
    # @param values [Array<Any>] The possible values
    # @return [Proc] A proc that returns +true+ if the object matches.
    def in?(*values)
      if !values.nil?
        values = values[0] if values.length == 1 and values[0].is_a? Array
        ->(o) { values.map { |l| wrap(l, ->(a, b) { a == b}).call(o) }.any? }
      else
        ANY
      end
    end

    # Matches a string that represents an integer value. By
    # default it only matches positive integer values but an
    # optional range my also be supplied.
    # @param range [Range] The range of numbers to match.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def integer?(range: (1..))
      proc do |o|
        o.is_a? String and o.is_i? and range.include?(o.to_i)
      end
    end

    # Matches a string that represents a boolean value.
    # @return [Proc] A proc that returns +true+ if the object matches.
    def boolean?
      proc do |o|
        o.is_a? String and o.is_b?
      end
    end

    # operators

    def and?(*conds)
      ->(o) { conds.map(->(c) { wrap(c).call(o) }).all? }
    end

    def or?(*conds)
      ->(o) { conds.map(->(c) { wrap(c).call(o) }).any? }
    end

    def not?(*conds)
      ->(o) { conds.map(->(c) { wrap(c).call(o) }).none? }
    end

    #
    # Scope options
    #

    # Prevents exceptions caused by procs or blocks from being
    # rescued. Optionally, an explicit list of exceptions not
    # to rescue can be provided instead.
    # @param exceptions [Array<Class>] Exceptions not to rescue (optional).
    def no_rescue(*exceptions)
      @options[:rescue] =
        if !exceptions.nil? and !exceptions.empty?
          ->(e) { !e.class.in?(exceptions) }
        else
          NONE
        end
    end

    private

    def wrap(arg, p = nil)
      if arg.is_a? Proc
        arg
      elsif !p.nil?
        ->(o) { p.call(arg, o) }
      else
        ->(o) { o.is_a? arg }
      end
    end
  end
end
