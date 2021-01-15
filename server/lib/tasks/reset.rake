require "fileutils"
require_relative "../../config/environment"

desc "Drops and recreates the databases and deletes all saved images."
task :reset do
  ["db:drop", "db:create", "db:migrate"].each do |t|
    Rake::Task[t].execute
  end

  # Tag.__elasticsearch__.delete_index!

  path = File.expand_path(ENV["IMAGE_DIR"], Rails.root)
  puts "Deleting #{path}"
  FileUtils.rm_r(path)
  puts "Creating #{path}"
  FileUtils.mkdir(path)
end
