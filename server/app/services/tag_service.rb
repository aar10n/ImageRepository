require "curb"
require "json"

TAGGER_URL = "http://localhost/api/tagger"

module TagService
  # Generates tags for an image using the tagger server
  # and then creates new +Tag+ records for each result.
  # @param image [Image] The image active record.
  # @param data [String] The image data.
  # @return [Array<Tag>] The created +Tag+ records.
  def self.tag_image(image, data)
    file = Curl::PostField.file("file", image.file_name) do |field|
      field.content = data
    end

    c = Curl::Easy.new(TAGGER_URL)
    c.multipart_form_post = true
    c.http_post(file)
    raise HttpError, c.response_code unless c.response_code == 200
    res = JSON.parse(c.body_str, symbolize_names: true)

    params = {
      width: res[:width],
      height: res[:height],
      orientation: res[:orientation]
    }
    image.update(params)
    image.tags.create(res[:tags].map { |tag| make_tag_obj(tag) })
  end

  # @param image [Image]
  # @param keywords [Array<String>]
  def self.add_keywords(image, keywords)
    return if keywords.length.zero?

    tags = keywords.map do |keyword|
      {
        image_id: image.id,
        kind: "keyword",
        value: keyword,
        count: nil
      }
    end

    image.tags.create(tags)
  end

  # Returns +true+ if the tagger server is online
  # and reachable.
  # @return [Boolean]
  def self.online?
    c = Curl.get(TAGGER_URL)
    c.response_code == 200
  end

  # @param obj [Hash] Tag object.
  # @return [Hash]
  def self.make_tag_obj(obj)
    kind = obj[:type]
    value = obj[:value]
    count = nil
    if kind == "feature"
      value = obj[:value][0]
      count = obj[:value][1]
    end

    { kind: kind, value: value, count: count }
  end
end
