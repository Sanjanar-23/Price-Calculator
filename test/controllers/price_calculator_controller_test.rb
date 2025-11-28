require "test_helper"

class PriceCalculatorControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get price_calculator_index_url
    assert_response :success
  end

  test "should get upload_csv" do
    get price_calculator_upload_csv_url
    assert_response :success
  end
end
