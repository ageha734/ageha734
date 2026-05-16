'use strict'

// ─── Scroll reveal (Intersection Observer) ───────────────────
function initReveal() {
    const observer = new IntersectionObserver(
        entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible')
                    observer.unobserve(entry.target)
                }
            }
        },
        {threshold: 0.12}
    )

    for (const el of document.querySelectorAll('.reveal, .reveal-stagger')) {
        observer.observe(el)
    }
}

// ─── Nav mobile toggle ────────────────────────────────────────
function initNav() {
    const toggle = document.getElementById('nav-toggle')
    const links = document.getElementById('nav-links')
    if (!toggle || !links) return

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open')
        toggle.setAttribute('aria-expanded', String(open))
    })

    // close on link click
    for (const a of links.querySelectorAll('a')) {
        a.addEventListener('click', () => {
            links.classList.remove('open')
            toggle.setAttribute('aria-expanded', 'false')
        })
    }

    // close on outside click
    document.addEventListener('click', e => {
        if (!toggle.contains(e.target) && !links.contains(e.target)) {
            links.classList.remove('open')
            toggle.setAttribute('aria-expanded', 'false')
        }
    })
}

// ─── Typing effect for hero ───────────────────────────────────
function initTyping() {
    const el = document.getElementById('typing-text')
    if (!el) return

    const phrases = el.dataset.phrases ? JSON.parse(el.dataset.phrases) : []
    if (!phrases.length) return

    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    const typeSpeed = 60
    const deleteSpeed = 35
    const pauseMs = 2200

    function tick() {
        const phrase = phrases[phraseIndex]
        if (deleting) {
            el.textContent = phrase.slice(0, charIndex - 1)
            charIndex--
            if (charIndex === 0) {
                deleting = false
                phraseIndex = (phraseIndex + 1) % phrases.length
            }
        } else {
            el.textContent = phrase.slice(0, charIndex + 1)
            charIndex++
            if (charIndex === phrase.length) {
                deleting = true
                setTimeout(tick, pauseMs)
                return
            }
        }
        setTimeout(tick, deleting ? deleteSpeed : typeSpeed)
    }

    tick()
}

// ─── Smooth active nav highlight ─────────────────────────────
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]')
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]')

    const observer = new IntersectionObserver(
        entries => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    for (const a of navLinks) {
                        a.classList.toggle(
                            'active',
                            a.getAttribute('href') === `#${entry.target.id}`
                        )
                    }
                }
            }
        },
        {threshold: 0.4}
    )

    for (const s of sections) observer.observe(s)
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initReveal()
    initNav()
    initTyping()
    initActiveNav()
})
