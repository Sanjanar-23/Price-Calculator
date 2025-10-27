Rails.application.routes.draw do
  root 'price_calculator#index'

  resources :price_calculator, only: [:index] do
    collection do
      post :upload_csv
      get :levels
      get :products
      get :part_numbers
      get :search_products
      get :search_part_numbers
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
