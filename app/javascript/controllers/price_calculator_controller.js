import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["anniversaryDate", "currentDate", "days", "level", "product", "dtpPrice", "price"]

  connect() {
    // Set today's date as default
    this.setToday()
  }

  setToday() {
    const today = new Date().toISOString().split('T')[0]
    this.currentDateTarget.value = today
    this.calculateDays()
  }

  calculateDays() {
    const anniversaryDate = this.anniversaryDateTarget.value
    const currentDate = this.currentDateTarget.value

    if (anniversaryDate && currentDate) {
      const anniversary = new Date(anniversaryDate)
      const current = new Date(currentDate)
      const timeDiff = current.getTime() - anniversary.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      this.daysTarget.value = daysDiff
      this.calculatePrice()
    } else {
      this.daysTarget.value = ""
      this.priceTarget.value = ""
    }
  }

  loadProducts() {
    const level = this.levelTarget.value
    const productSelect = this.productTarget

    // Clear existing options
    productSelect.innerHTML = '<option value="">Select Product</option>'
    this.dtpPriceTarget.value = ""
    this.priceTarget.value = ""

    if (level) {
      fetch(`/price_calculator/products?level=${encodeURIComponent(level)}`)
        .then(response => response.json())
        .then(products => {
          products.forEach(product => {
            const option = document.createElement('option')
            option.value = product.dtp_price
            option.textContent = product.name
            option.dataset.dtpPrice = product.dtp_price
            productSelect.appendChild(option)
          })
        })
        .catch(error => {
          console.error('Error loading products:', error)
        })
    }
  }

  updateDtpPrice() {
    const selectedOption = this.productTarget.selectedOptions[0]
    if (selectedOption && selectedOption.dataset.dtpPrice) {
      this.dtpPriceTarget.value = selectedOption.dataset.dtpPrice
      this.calculatePrice()
    } else {
      this.dtpPriceTarget.value = ""
      this.priceTarget.value = ""
    }
  }

  calculatePrice() {
    const days = parseInt(this.daysTarget.value)
    const dtpPrice = parseFloat(this.dtpPriceTarget.value)

    if (days && dtpPrice) {
      // Price = DTP Price × (Days / 365) × 1.1
      const price = dtpPrice * (days / 365) * 1.1
      this.priceTarget.value = price.toFixed(2)
    } else {
      this.priceTarget.value = ""
    }
  }

  copyDtpPrice() {
    const dtpPrice = this.dtpPriceTarget.value
    if (dtpPrice) {
      navigator.clipboard.writeText(dtpPrice).then(() => {
        // Show a temporary success message
        const button = event.target.closest('button')
        const originalHTML = button.innerHTML
        button.innerHTML = '<i class="bi bi-check"></i> Copied!'
        button.classList.add('btn-success')
        button.classList.remove('btn-outline-secondary')

        setTimeout(() => {
          button.innerHTML = originalHTML
          button.classList.remove('btn-success')
          button.classList.add('btn-outline-secondary')
        }, 2000)
      }).catch(err => {
        console.error('Failed to copy: ', err)
        alert('Failed to copy to clipboard')
      })
    }
  }
}
