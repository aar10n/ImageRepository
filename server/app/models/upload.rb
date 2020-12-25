# Represents an uploaded but not yet published image.
# After the image data is initially uploaded, an +Upload+
# record is created that allows the image metadata to be
# filled in via a PATCH request to a special url.
class Upload < ApplicationRecord
  include ActiveModel::Serialization

  # def attributes
  #   { "url" => nil }
  # end
end
