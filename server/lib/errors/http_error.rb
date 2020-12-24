class HttpError < RuntimeError
  attr_accessor :code

  def initialize(code = 500)
    super(nil)
    @code = code
  end
end
