AUTH_VALIDATOR = Utils.validator do
  key :type, is: value?("Basic")
  key :user, is: value?("Secret")
  key :pass, is: String
end

module Authenticated
  extend ActiveSupport::Concern
  extend ActionController

  included do
    @@_auth_actions = []
    @@_auth_model = nil
    @@_auth_param = nil
  end

  # intercept actions
  def process(action, *args)
    if action.in? @@_auth_actions
      param = params[@@_auth_param]
      auth = Utils.decode_auth(request.authorization)
      raise HttpError, 401 unless AUTH_VALIDATOR.call(auth)
      model = @@_auth_model.find_by(@@_auth_attr => param, secret: auth[:pass])
      raise HttpError, 401 if model.nil?
    end

    super(action, *args)
  end

  module ClassMethods
    def authorize(*actions, model: Image, attr: :shortlink, using: :id)
      @@_auth_actions = actions
      @@_auth_model = model
      @@_auth_attr = attr
      @@_auth_param = using
    end
  end
end
