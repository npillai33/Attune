// Preset playlist covers — grounded in musical feel
export const COVERS = {
  euphoria: 'linear-gradient(135deg, #F857A6, #FF5858)',
  dreamy: 'linear-gradient(135deg, #7B2FF7, #F107A3)',
  moody: 'linear-gradient(135deg, #355C7D, #6C5B7B)',
  upbeat: 'linear-gradient(135deg, #FF6B6B, #FFB84D)',
  smooth: 'linear-gradient(135deg, #5B5FEF, #8A2BE2)',
  electric: 'linear-gradient(135deg, #2E3192, #1BFFFF)',
  mellow: 'linear-gradient(135deg, #00C2A8, #0077B6)',
  soulful: 'linear-gradient(135deg, #00917D, #00C2A8)',
  hype: 'linear-gradient(135deg, #FF5858, #FFB84D)',
  dark: 'linear-gradient(135deg, #232526, #414345)',
}

// Display labels
export const COVER_LABELS = {
  euphoria: 'euphoria',
  dreamy: 'dreamy',
  moody: 'moody',
  upbeat: 'upbeat',
  smooth: 'smooth',
  electric: 'electric',
  mellow: 'mellow',
  soulful: 'soulful',
  hype: 'hype',
  dark: 'dark',
}

const HEX = /^#[0-9A-Fa-f]{6}$/

export function getCoverStyle(cover) {
  if (!cover) return COVERS.smooth

  // preset key
  if (COVERS[cover]) return COVERS[cover]

  // custom: "custom:#RRGGBB:#RRGGBB:angle"
  if (cover.startsWith('custom:')) {
    const [, c1, c2, angle] = cover.split(':')
    if (HEX.test(c1) && HEX.test(c2)) {
      const deg = Number.parseInt(angle, 10)
      return `linear-gradient(${Number.isFinite(deg) ? deg : 135}deg, ${c1}, ${c2})`
    }
  }

  return COVERS.smooth
}

export function buildCustomCover(c1, c2, angle = 135) {
  return `custom:${c1}:${c2}:${angle}`
}

export const COVER_KEYS = Object.keys(COVERS)