##
# Represets a collection of created resources.
# This is not to be confused with the `Image` class, as this
# only contains information about created resources and has
# nothing to do with the uploaded content itself.
class Upload < ApplicationRecord
  include ActiveModel::Serialization

  def attributes
    { "url" => nil }
  end
end
