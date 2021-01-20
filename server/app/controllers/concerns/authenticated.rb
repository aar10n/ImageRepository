AUTH_VALIDATOR = Validation.validator do
  key :type, is: value?("Basic")
  key :user, is: value?("Owner")
  key :pass, is: String
end

module Authenticated
  extend ActiveSupport::Concern
  extend ActionController

  def included(base)
    base.extend ClassMethods

    @_auth_actions = []
    @_auth_model = nil
    @_auth_attr = nil
    @_auth_param = nil
  end

  # intercept actions
  def process(action, *args)
    auth_actions = self.class._auth_actions
    auth_model = self.class._auth_model
    auth_attr = self.class._auth_attr
    auth_param = self.class._auth_param

    if action.to_sym.in? auth_actions
      param = params[auth_param]
      auth = Utils.decode_auth(request.authorization)
      raise HttpError, 401 unless AUTH_VALIDATOR.call(auth)
      model = auth_model&.find_by(id: param, auth_attr => auth[:pass])
      raise HttpError, 401 if model.nil?
    end

    super(action, *args)
  end

  module ClassMethods
    attr_reader :_auth_actions, :_auth_model, :_auth_attr, :_auth_param

    def authorize(*actions, model: Image, attr: :secret, param: :id)
      @_auth_actions = actions
      @_auth_model = model
      @_auth_attr = attr
      @_auth_param = param
    end
  end
end
