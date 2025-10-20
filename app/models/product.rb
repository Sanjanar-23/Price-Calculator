class Product < ApplicationRecord
  validates :name, presence: true
  validates :level, presence: true
  validates :dtp_price, presence: true, numericality: { greater_than: 0 }
end
