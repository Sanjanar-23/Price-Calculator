class Product < ApplicationRecord
  validates :name, presence: true
  validates :level, presence: true
  validates :dtp_price, presence: true, numericality: { greater_than: 0 }
  validates :part_number, presence: true, uniqueness: true
end
