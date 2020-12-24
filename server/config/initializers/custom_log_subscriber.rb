require "active_support/log_subscriber"
require "action_controller/log_subscriber"
require "errors/http_error"

module Server
  class CustomLogSubscriber < ActionController::LogSubscriber
    def process_action(event)
      exception = event.payload.fetch(:exception_object, nil)
      event.payload[:status] = exception.code if exception&.is_a? HttpError
      super(event)
    end
  end
end

%w[process_action start_processing].each do |evt|
  ActiveSupport::Notifications.unsubscribe "#{evt}.action_controller"
end

Server::CustomLogSubscriber.attach_to :action_controller
