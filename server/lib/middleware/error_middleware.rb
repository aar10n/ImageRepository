require_relative "../errors/http_error"

HTTP_STATUS = Rack::Utils::HTTP_STATUS_CODES

class ErrorMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    request = ActionDispatch::Request.new env
    @app.call(env)
  rescue HttpError => e
    puts ">>> exception <<<"
    request ||= nil
    raise e if e.code == 500
    raise e unless request&.show_exceptions?
    render_exception(e)
  end

  private

  def render_exception(exception)
    code = exception.code
    raise exception unless HTTP_STATUS.key?(code)

    body = "#{code} #{HTTP_STATUS.fetch(code, HTTP_STATUS[500])}"
    headers = {
      "Content-Type" => "text/plain",
      "Content-Length" => body.length
    }

    [code, headers, [body]]
  end
end
