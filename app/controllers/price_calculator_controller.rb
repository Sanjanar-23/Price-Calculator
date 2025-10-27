require 'csv'

class PriceCalculatorController < ApplicationController
  # Level mapping table for normalization
  LEVEL_MAPPING = {
    'Level 1 1 - 9' => 'Level 1',
    'Level 12 10 - 49 (VIP Select 3 year commit)' => 'Level 12',
    'Level 4 100+' => 'Level 4',
    'Tier 3 2500 to 4999 Transactions' => 'Tier 3',
    'Level 13 50 - 99 (VIP Select 3 year commit)' => 'Level 13',
    'Level 14 100+ (VIP Select 3 year commit)' => 'Level 14',
    'Level 2 10 - 49' => 'Level 2',
    'Level 3 50 - 99' => 'Level 3',
    'Tier 1 1 to 999 Transactions' => 'Tier 1',
    'Tier 2 1000 to 2499 Transactions' => 'Tier 2',
    'Tier A 1 to 999 Transactions (VIP Select 3 year commit)' => 'Tier A',
    'Tier B 1000 to 2499 Transactions (VIP Select 3 year commit)' => 'Tier B'
  }.freeze
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

        # Debug: Log the headers to see what columns are available
        Rails.logger.info "CSV Headers: #{csv_data.headers.inspect}"

        csv_data.each_with_index do |row, index|
          # Debug: Log each row to see the data
          Rails.logger.info "Row #{index}: #{row.to_h.inspect}"

          # Read ONLY the specific columns you mentioned
          product_name = row['Product Family']
          level_detail = row['Level Detail']
          dtp_price = row['Unit DTP per Year / Per Txn']
          part_number = row['Part Number']

          # Debug: Log the extracted values
          Rails.logger.info "Extracted - Product: '#{product_name}', Level: '#{level_detail}', DTP: '#{dtp_price}', Part Number: '#{part_number}'"

          # Skip rows with missing essential data
          next if product_name.blank? || level_detail.blank? || dtp_price.blank?

          # Normalize level using mapping table
          normalized_level = LEVEL_MAPPING[level_detail] || level_detail || "Unknown"

          # Use Part Number from CSV if available, otherwise generate one
          final_part_number = part_number.present? ? part_number : "PN-#{index + 1}-#{normalized_level.to_s.gsub(/\s+/, '')}"

          Product.create!(
            name: product_name,
            level: normalized_level,
            dtp_price: dtp_price,
            part_number: final_part_number
          )
        end

        flash[:success] = "CSV file uploaded successfully! #{Product.count} products imported with level normalization."
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
    @products = Product.where(level: params[:level]).pluck(:name, :dtp_price, :part_number)
    render json: @products.map { |name, price, part_number| { name: name, dtp_price: price, part_number: part_number } }
  end

  def part_numbers
    @part_numbers = Product.where(level: params[:level]).pluck(:part_number, :name)
    render json: @part_numbers.map { |part_number, name| { part_number: part_number, name: name } }
  end

  def search_products
    level = params[:level]
    query = params[:query]

            if level.present? && query.present?
              @products = Product.where(level: level)
                                .where("name LIKE ?", "%#{query}%")
                                .pluck(:name, :dtp_price, :part_number)
              render json: @products.map { |name, price, part_number| { name: name, dtp_price: price, part_number: part_number } }
            else
              render json: []
            end
  end

  def search_part_numbers
    level = params[:level]
    query = params[:query]

            if level.present? && query.present?
              @part_numbers = Product.where(level: level)
                                    .where("part_number LIKE ?", "%#{query}%")
                                    .pluck(:part_number, :name, :dtp_price)
              render json: @part_numbers.map { |part_number, name, price| { part_number: part_number, name: name, dtp_price: price } }
            else
              render json: []
            end
  end
end
