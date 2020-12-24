ANY = proc { true }

module Utils
  def self.validator(&block)
    Validator.new(&block).build
  end

  class Validator
    attr_accessor :keys, :validators

    def initialize(*_, &block)
      @validators = []
      @keys = []
      instance_eval(&block)
    end

    def build
      ->(obj) { @validators.map { |v| v.call(obj) }.all? }
    end

    # base conditions

    def is(type, optional: false, &block)
      v = block_given? ? Validator.new(&block).build : wrap(type)
      @validators << lambda do |o|
        v.call(o) or optional
      end
    end

    def key(key, is: ANY, optional: false, &block)
      v = block_given? ? Validator.new(&block).build : wrap(is)
      @keys << key
      @validators << lambda do |o|
        o.is_a? Hash and ((o.key?(key) and v.call(o[key])) or optional)
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
          vs = Validator.new(&block).validators
          ->(obj) { vs.map { |v| v.call(obj) }.none? }
        else
          ANY
        end
    end

    # one or more of the conditions must be true
    def any(&block)
      @validators <<
        if block_given?
          vs = Validator.new(&block).validators
          ->(obj) { vs.map { |v| v.call(obj) }.any? }
        else
          ANY
        end
    end

    # only one of the conditions can be true
    def one(&block)
      @validators <<
        if block_given?
          ->(obj) { Validator.new(&block).validators.map { |v| v.call(obj) }.one? }
        else
          ANY
        end
    end

    # all of the conditions must be true
    def all(&block)
      @validators <<
        if block_given?
          vs = Validator.new(&block).validators
          ->(obj) { vs.map { |v| v.call(obj) }.all? }
        else
          ANY
        end
    end

    # only the specified keys can be present
    def only(&block)
      @validators <<
        if block_given?
          val = Validator.new(&block)
          lambda do |obj|
            obj.is_a? Hash and val.validators.map { |v| v.call(obj) }.all? and
              obj.keys.map { |k| k.in?(val.keys) }.all?
          end
        else
          ANY
        end
    end

    # other matchers

    def array?(of: ANY, &block)
      v = block_given? ? Validator.new(&block).build : wrap(of)
      lambda do |o|
        o.is_a? Array and o.map { |e| v.call(e) }.all?
      end
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
