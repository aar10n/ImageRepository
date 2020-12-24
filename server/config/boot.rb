ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)
ENV["RAILS_ENV"] = "development"


require "bundler/setup" # Set up gems listed in the Gemfile.
