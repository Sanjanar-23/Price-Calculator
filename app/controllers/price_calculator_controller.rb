require 'csv'

class PriceCalculatorController < ApplicationController
  def index
    @products = Product.all
    @levels = Product.distinct.pluck(:level).compact.sort
  end

  def upload_csv
    if params[:csv_file].present?
      begin
        # Clear existing products
        Product.destroy_all

        # Parse CSV file
        csv_data = CSV.read(params[:csv_file].tempfile, headers: true)

        csv_data.each do |row|
          Product.create!(
            name: row['Product Name'] || row['product_name'] || row['Product'],
            level: row['Level'] || row['level'],
            dtp_price: row['DTP Price'] || row['dtp_price'] || row['DTP']
          )
        end

        flash[:success] = "CSV file uploaded successfully! #{Product.count} products imported."
      rescue => e
        flash[:error] = "Error uploading CSV: #{e.message}"
      end
    else
      flash[:error] = "Please select a CSV file to upload."
    end

    redirect_to root_path
  end

  def levels
    @levels = Product.distinct.pluck(:level).compact.sort
    render json: @levels
  end

  def products
    @products = Product.where(level: params[:level]).pluck(:name, :dtp_price)
    render json: @products.map { |name, price| { name: name, dtp_price: price } }
  end
end
