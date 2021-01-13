class String
  # Returns +true+ if the string represents a valid
  # integer value, +false+ otherwise.
  def is_i?
    !!(self =~ /\A[-+]?[0-9]+\z/)
  end

  # Returns +true+ if the string represents a valid
  # boolean value, +false+ otherwise.
  def is_b?
    self == "true" or self == "false"
  end

  def to_b
    case self
    when "true"
      true
    when "false"
      false
    else
      raise ArgumentError
    end
  end
end
