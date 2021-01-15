module Utils
  # @param auth [String]
  # @return [Hash]
  def self.decode_auth(auth)
    return {} if auth.nil?
    type, creds = auth.split(" ")
    user, pass = Base64.decode64(creds).split(":")
    { type: type, user: user, pass: pass }
  end

  # @param obj [Array, Hash]
  def self.symbolize(obj)
    case obj
    when Array
      obj.map { |e| Utils.symbolize(e) }
    when Hash
      obj.symbolize_keys
    else
      raise RuntimeError
    end
  end
end
