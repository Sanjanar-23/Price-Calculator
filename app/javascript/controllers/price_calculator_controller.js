import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["anniversaryDate", "currentDate", "days", "level", "partNumber", "productName", "dtpPrice", "price"]

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

    // Clear searchable fields when level changes
    this.partNumberTarget.value = ""
    this.productNameTarget.value = ""
    this.dtpPriceTarget.value = ""
    this.priceTarget.value = ""

    // Hide suggestions
    document.getElementById('part_number_suggestions').style.display = 'none'
    document.getElementById('product_name_suggestions').style.display = 'none'
  }

  searchPartNumbers() {
    const level = this.levelTarget.value
    const query = this.partNumberTarget.value
    const suggestions = document.getElementById('part_number_suggestions')

    if (level && query.length >= 2) {
      fetch(`/price_calculator/search_part_numbers?level=${encodeURIComponent(level)}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
          suggestions.innerHTML = ''
          if (results.length > 0) {
            results.forEach(item => {
              const option = document.createElement('div')
              option.className = 'dropdown-item'
              option.innerHTML = `<strong>${item.part_number}</strong><br><small>${item.name}</small>`
              option.addEventListener('click', () => {
                this.partNumberTarget.value = item.part_number
                this.productNameTarget.value = item.name
                this.dtpPriceTarget.value = item.dtp_price
                suggestions.style.display = 'none'
                this.calculatePrice()
              })
              suggestions.appendChild(option)
            })
            suggestions.style.display = 'block'
          } else {
            suggestions.style.display = 'none'
          }
        })
        .catch(error => {
          console.error('Error searching part numbers:', error)
        })
    } else {
      suggestions.style.display = 'none'
    }
  }

  searchProducts() {
    const level = this.levelTarget.value
    const query = this.productNameTarget.value
    const suggestions = document.getElementById('product_name_suggestions')

    if (level && query.length >= 2) {
      fetch(`/price_calculator/search_products?level=${encodeURIComponent(level)}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(results => {
          suggestions.innerHTML = ''
          if (results.length > 0) {
            results.forEach(item => {
              const option = document.createElement('div')
              option.className = 'dropdown-item'
              option.innerHTML = `<strong>${item.name}</strong><br><small>Part: ${item.part_number}</small>`
              option.addEventListener('click', () => {
                this.productNameTarget.value = item.name
                this.partNumberTarget.value = item.part_number
                this.dtpPriceTarget.value = item.dtp_price
                suggestions.style.display = 'none'
                this.calculatePrice()
              })
              suggestions.appendChild(option)
            })
            suggestions.style.display = 'block'
          } else {
            suggestions.style.display = 'none'
          }
        })
        .catch(error => {
          console.error('Error searching products:', error)
        })
    } else {
      suggestions.style.display = 'none'
    }
  }

  calculatePrice() {
    const days = parseInt(this.daysTarget.value)
    const dtpPrice = parseFloat(this.dtpPriceTarget.value)

    if (days && dtpPrice) {
      // Price = (DTP Price/365) * days
      const price = (dtpPrice / 365) * days
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
