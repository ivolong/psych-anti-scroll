/* global chrome, location */

let scrollSpeed = 40
let domains = []

function loadSettings () {
  chrome.storage.local.get(['scrollSpeed', 'domains'], data => {
    scrollSpeed = data.scrollSpeed ?? 25
    domains = data.domains ?? []
  })
}

loadSettings()

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return
  }

  if (changes.scrollSpeed) {
    scrollSpeed = changes.scrollSpeed.newValue
  }

  if (changes.domains) {
    domains = changes.domains.newValue
  }
})

function enabledForSite () {
  const host = location.hostname
  return domains.some(domain =>
    host === domain || host.endsWith('.' + domain)
  )
}

window.addEventListener('wheel', e => {
  if (!enabledForSite()) {
    return
  }

  const newDelta = e.deltaY * (scrollSpeed / 100)

  window.scrollBy({
    top: newDelta,
    behavior: 'auto'
  })

  e.preventDefault()
}, { passive: false })
