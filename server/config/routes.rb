Rails.application.routes.draw do
  namespace :api do
    resources :images do
      collection do
        patch "(/:id)", to: "images#update", as: ""
      end
    end
    resources :search, only: [:show]
  end
end
