Rails.application.routes.draw do
  namespace :api do
    resources :images
    scope :images, as: "image" do
      get "/:id/tags", to: "tags#index", as: "tags"
      post "/:id/tags", to: "tags#create"
      delete "/:id/tags/:name", to: "tags#destroy", as: "tag"
    end
    resources :search, only: [:index, :show], param: :query
  end
end
