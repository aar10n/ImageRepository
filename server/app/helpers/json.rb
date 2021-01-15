module Json
  class JsonBuilder
    def initialize(parent = nil, scope = "root", &block)
      @builders = []
      @parent = parent
      @scope = scope

      instance_eval(&block)
    end
  end
end
