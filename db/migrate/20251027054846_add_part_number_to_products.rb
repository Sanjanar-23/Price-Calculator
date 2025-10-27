class AddPartNumberToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :part_number, :string
  end
end
