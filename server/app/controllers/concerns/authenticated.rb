AUTH_VALIDATOR = Validation.validator do
  key :type, is: value?("Basic")
  key :user, is: value?("Owner")
  key :pass, is: String
end

module Authenticated
  extend ActiveSupport::Concern
  extend ActionController

  cattr_accessor :_auth_actions
  cattr_accessor :_auth_model
  cattr_accessor :_auth_param

  included do
    @@_auth_actions = []
    @@_auth_model = nil
    @@_auth_attr = nil
    @@_auth_param = nil
  end

  # intercept actions
  def process(action, *args)
    if action.to_sym.in? @@_auth_actions
      param = params[@@_auth_param]
      auth = Utils.decode_auth(request.authorization)
      raise HttpError, 401 unless AUTH_VALIDATOR.call(auth)
      model = @@_auth_model.find_by(@@_auth_attr => param, secret: auth[:pass])
      raise HttpError, 401 if model.nil?
    end

    super(action, *args)
  end

  module ClassMethods
    def authorize(*actions, model: Image, attr: :id, using: :id)
      class_variable_set(:@@_auth_actions, actions)
      class_variable_set(:@@_auth_model, model)
      class_variable_set(:@@_auth_attr, attr)
      class_variable_set(:@@_auth_param, using)
    end
  end
end
