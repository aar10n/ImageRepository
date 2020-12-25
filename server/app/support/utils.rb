ANY = proc { true }

module Utils
  def self.validator(&block)
    Validator.new(&block).build
  end

  class Validator
    attr_accessor :keys, :validators

    def initialize(parent = nil, options = {}, &block)
      @validators = []
      @keys = []
      @options = options
      @parent = parent

      @options[:optional] ||= false
      instance_eval(&block)
    end

    def build
      ->(obj) { @validators.map { |v| v.call(obj) }.all? }
    end

    # base conditions

    def is(type, optional: false, &block)
      v =
        if block_given?
          val = Validator.new(self, @options, &block)
          @keys << val.keys
          val.build
        else
          wrap(type)
        end

      @validators << lambda do |o|
        v.call(o) or optional
      end
    end

    def key(key, is: ANY, optional: false, &block)
      opt = @options[:optional] || optional
      v = block_given? ? Validator.new(self, @options, &block).build : wrap(is)
      @keys << key
      @parent.keys << key unless @parent.nil?
      @validators << lambda do |o|
        o.is_a? Hash and ((o.key?(key) and v.call(o[key])) or opt)
      end
    end

    def length(n, operator: :==)
      allowed = %i[== < > <= >= !=]
      op = operator.in?(allowed) ? operator : :==

      @validators << lambda do |o|
        o.respond_to?(:length) and o.length.send(op, n)
      end
    end

    # block types

    # invert the condition
    def none(&block)
      @validators <<
        if block_given?
          val = Validator.new(self, @options, &block)
          ->(obj) { val.validators.map { |v| v.call(obj) }.none? }
        else
          ANY
        end
    end

    # one or more of the conditions must be true
    def any(&block)
      @validators <<
        if block_given?
          val = Validator.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.any? }
        else
          ANY
        end
    end

    # only one of the conditions can be true
    def one(&block)
      @validators <<
        if block_given?
          val = Validator.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.one? }
        else
          ANY
        end
    end

    # all of the conditions must be true
    def all(&block)
      @validators <<
        if block_given?
          val = Validator.new(self, @options, &block)
          @keys << val.keys
          ->(obj) { val.validators.map { |v| v.call(obj) }.all? }
        else
          ANY
        end
    end

    # all of the specified keys are optional
    def optional(&block)
      @validators <<
        if block_given?
          opts = @options.dup
          opts[:optional] = true
          Validator.new(self, opts, &block).build
        else
          ANY
        end
    end

    # only the specified keys can be present
    def only(&block)
      @validators <<
        if block_given?
          val = Validator.new(self, @options, &block)
          lambda do |obj|
            obj.is_a? Hash and val.validators.map { |v| v.call(obj) }.all? and
              obj.symbolize_keys.keys.map { |k| k.in?(val.keys) }.all?
          end
        else
          ANY
        end
    end

    # other matchers

    def array(of: ANY)
      v = wrap(of)
      lambda do |o|
        o.is_a? Array and o.map { |e| v.call(e) }.all?
      end
    end

    def union(*types)
      tm = types.map { |t| wrap(t) }
      ->(o) { tm.map { |t| t.call(o) }.any? }
    end

    private

    def wrap(arg)
      if arg.is_a? Proc
        arg
      else
        # ->(o) { o.is_a? arg }
        lambda do |o|
          o.is_a? arg
        end
      end
    end
  end
end
