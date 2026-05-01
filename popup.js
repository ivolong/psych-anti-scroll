/* global chrome */

const slider = document.getElementById('speed-slider')
const speedValue = document.getElementById('speed-value')

const domainInput = document.getElementById('domain-input')
const domainInputLabel = document.getElementById('domain-input-label')
const addDomainButton = document.getElementById('add-domain')
const domainList = document.getElementById('domain-list')

let domains = []

function loadSettings () {
  chrome.storage.local.get(['scrollSpeed', 'domains'], data => {
    const speed = data.scrollSpeed ?? 20
    domains = (data.domains ?? []).sort()

    slider.value = speed
    updateSpeedLabel(speed)

    renderDomains()
  })
}

function updateSpeedLabel (v) {
  speedValue.textContent = `${v}%`
}

slider.addEventListener('input', () => {
  const value = parseInt(slider.value)

  updateSpeedLabel(value)
  chrome.storage.local.set({
    scrollSpeed: value
  })
})

function renderDomains () {
  domainList.innerHTML = ''

  domains.forEach(domain => {
    const domainDiv = document.createElement('div')
    domainDiv.classList.add('domain-item', 'wash')

    const domainText = document.createElement('span')
    domainText.textContent = domain

    const removeButton = document.createElement('span')
    removeButton.textContent = '×'
    removeButton.className = 'remove'

    removeButton.addEventListener('pointerdown', () => {
      domainDiv.classList.add('is-loading')
      domainDiv.holdTimer = setTimeout(() => {
        domainDiv.classList.add('removed')
        domainDiv.classList.remove('is-loading')
        domainText.parentElement.innerHTML = 'Removed'

        domains = domains.filter(d => d !== domain)
        chrome.storage.local.set({ domains })
      }, 10e3)
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(e =>
      removeButton.addEventListener(e, () => {
        domainDiv.classList.remove('is-loading')
        clearTimeout(domainDiv.holdTimer)
      })
    )

    domainDiv.appendChild(domainText)
    domainDiv.appendChild(removeButton)
    domainList.appendChild(domainDiv)
  })
}

function displayLabel (element, content, duration) {
  element.textContent = content

  element.classList.add('orange')
  setTimeout(() => {
    element.classList.remove('orange')
  }, 500)

  setTimeout(() => { element.textContent = '' }, duration)
}

function addDomain () {
  let domain = domainInput.value.trim().toLowerCase()
  if (!domain.includes('://')) {
    domain = `http://${domain}`
  }

  try {
    domain = new URL(domain).hostname
  } catch (e) {
    displayLabel(domainInputLabel, 'Invalid website format', 5e3)
    return
  }

  if (domains.includes(domain)) {
    displayLabel(domainInputLabel, 'Website already enabled', 5e3)
    return
  }

  domains.unshift(domain)
  chrome.storage.local.set({ domains })

  domainInput.value = ''

  renderDomains()
}

addDomainButton.addEventListener('click', addDomain)
domainInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    addDomain()
  }
})

loadSettings()
