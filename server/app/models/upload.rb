# Represents an uploaded but not yet published image.
# After the image data is initially uploaded, an +Upload+
# record is created that allows the image metadata to be
# filled in via a PUT request to a special url.
class Upload < ApplicationRecord
  include ActiveModel::Serialization
  belongs_to :image
end
