class Hash
  # Returns a new hash with only the given keys.
  def with(*keys)
    keys = keys.flatten
    pairs = each_pair.filter { |k, _| k.in? keys }
    pairs.to_h
  end

  # Returns a new hash with all the given keys filtered out.
  def without(*keys)
    keys = keys.flatten
    pairs = each_pair.filter { |k, _| !k.in?(keys) }
    pairs.to_h
  end
end
