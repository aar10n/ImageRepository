require_relative "boot"

require "fileutils"
require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"

require_relative "../lib/middleware/error_middleware"
require_relative "../lib/mixins/string"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Server
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.middleware.use ErrorMiddleware

    config.after_initialize do
      ENV["DATA_DIR"] = File.expand_path(ENV["DATA_DIR"], __dir__)
      ENV["IMAGES_DIR"] = File.join(ENV["DATA_DIR"], "/images")

      puts ENV["DATA_DIR"]
      puts ENV["IMAGES_DIR"]

      FileUtils.mkdir_p(ENV["IMAGES_DIR"]) unless File.directory?(ENV["IMAGES_DIR"])
    end
  end
end
