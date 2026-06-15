import './style.css'

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

// ─── Canvas sizing ────────────────────────────────────
function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

// ─── Constants ────────────────────────────────────────
const PLAYER_SPEED = 6
const PLAYER_SIZE = 20
const BULLET_SPEED = 8
const BULLET_WIDTH = 4
const BULLET_HEIGHT = 14
const ENEMY_SIZE = 18
const ENEMY_SPEED_MIN = 1.5
const ENEMY_SPEED_MAX = 3.5
const FIRE_COOLDOWN = 12 // frames between shots

// ─── Game state ───────────────────────────────────────
let player, bullets, enemies, particles
let score, fireTimer, enemyTimer, gameOver
let keys = {}

function init() {
  player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    w: PLAYER_SIZE * 2,
    h: PLAYER_SIZE * 2,
  }
  bullets = []
  enemies = []
  particles = []
  score = 0
  fireTimer = 0
  enemyTimer = 0
  gameOver = false
}
init()

// ─── Input ────────────────────────────────────────────
window.addEventListener('keydown', e => {
  keys[e.code] = true
  if (e.code === 'Space') e.preventDefault()
})

window.addEventListener('keyup', e => {
  keys[e.code] = false
})

// Touch controls
let touchActive = false
let touchX = 0
let touchY = 0

canvas.addEventListener('touchstart', e => {
  e.preventDefault()
  const t = e.touches[0]
  touchActive = true
  touchX = t.clientX
  touchY = t.clientY
})

canvas.addEventListener('touchmove', e => {
  e.preventDefault()
  const t = e.touches[0]
  touchX = t.clientX
  touchY = t.clientY
})

canvas.addEventListener('touchend', e => {
  e.preventDefault()
  touchActive = false
})

// Click/tap to restart
canvas.addEventListener('click', () => {
  if (gameOver) init()
})

// ─── Drawing helpers ──────────────────────────────────
function drawPlayer() {
  const { x, y, w, h } = player
  ctx.save()
  ctx.translate(x, y)

  // Engine glow
  const glow = ctx.createRadialGradient(0, h / 2 + 4, 2, 0, h / 2 + 8, 14)
  glow.addColorStop(0, '#4af')
  glow.addColorStop(0.5, '#08f')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(-10, h / 2, 20, 20)

  // Body
  ctx.fillStyle = '#3bf'
  ctx.beginPath()
  ctx.moveTo(0, -h / 2)           // nose
  ctx.lineTo(-w / 2, h / 2)       // left wing
  ctx.lineTo(-w / 6, h / 3)       // left indentation
  ctx.lineTo(0, h / 4)            // tail center
  ctx.lineTo(w / 6, h / 3)        // right indentation
  ctx.lineTo(w / 2, h / 2)        // right wing
  ctx.closePath()
  ctx.fill()

  // Cockpit
  ctx.fillStyle = '#8df'
  ctx.beginPath()
  ctx.ellipse(0, -2, 4, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawEnemy(e) {
  ctx.save()
  ctx.translate(e.x, e.y)

  // Body (inverted triangle)
  ctx.fillStyle = e.type === 'big' ? '#f55' : '#f84'
  ctx.beginPath()
  ctx.moveTo(0, e.h / 2)
  ctx.lineTo(-e.w / 2, -e.h / 2)
  ctx.lineTo(e.w / 2, -e.h / 2)
  ctx.closePath()
  ctx.fill()

  // Cockpit
  ctx.fillStyle = '#fcc'
  ctx.beginPath()
  ctx.ellipse(0, 2, 3, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawBullet(b) {
  const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h)
  grad.addColorStop(0, '#fff')
  grad.addColorStop(1, '#ff0')
  ctx.fillStyle = grad
  ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 4
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 20,
      color,
      size: 1.5 + Math.random() * 3,
    })
  }
}

// ─── Starfield background ─────────────────────────────
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 2 + 0.5,
  speed: Math.random() * 1.5 + 0.3,
}))

function updateAndDrawStars() {
  ctx.fillStyle = '#fff'
  for (const s of stars) {
    s.y += s.speed
    if (s.y > canvas.height) {
      s.y = -2
      s.x = Math.random() * canvas.width
    }
    ctx.globalAlpha = 0.4 + Math.random() * 0.6
    ctx.fillRect(s.x, s.y, s.size, s.size)
  }
  ctx.globalAlpha = 1
}

// ─── Collision ────────────────────────────────────────
function rectsCollide(a, b) {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2
  )
}

// ─── Update ───────────────────────────────────────────
function update() {
  if (gameOver) return

  // Player movement
  let dx = 0, dy = 0
  if (keys['ArrowLeft'] || keys['KeyA']) dx = -1
  if (keys['ArrowRight'] || keys['KeyD']) dx = 1
  if (keys['ArrowUp'] || keys['KeyW']) dy = -1
  if (keys['ArrowDown'] || keys['KeyS']) dy = 1

  // Touch follow
  if (touchActive) {
    const targetX = touchX
    const targetY = touchY
    const distX = targetX - player.x
    const distY = targetY - player.y
    const dist = Math.sqrt(distX * distX + distY * distY)
    if (dist > 3) {
      const speed = Math.min(PLAYER_SPEED + 2, dist)
      dx = distX / dist
      dy = distY / dist
      player.x += dx * speed
      player.y += dy * speed
    }
  } else {
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const diag = Math.SQRT1_2
      dx *= diag
      dy *= diag
    }
    player.x += dx * PLAYER_SPEED
    player.y += dy * PLAYER_SPEED
  }

  // Clamp player to bounds
  player.x = Math.max(player.w / 2, Math.min(canvas.width - player.w / 2, player.x))
  player.y = Math.max(player.h / 2, Math.min(canvas.height - player.h / 2, player.y))

  // Fire bullets (space or auto-fire on touch)
  fireTimer--
  if ((keys['Space'] || touchActive) && fireTimer <= 0) {
    bullets.push({
      x: player.x,
      y: player.y - player.h / 2,
      w: BULLET_WIDTH,
      h: BULLET_HEIGHT,
    })
    fireTimer = FIRE_COOLDOWN
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= BULLET_SPEED
    if (bullets[i].y < -20) {
      bullets.splice(i, 1)
    }
  }

  // Spawn enemies
  enemyTimer--
  if (enemyTimer <= 0) {
    const type = Math.random() < 0.12 ? 'big' : 'normal'
    const size = type === 'big' ? ENEMY_SIZE * 1.6 : ENEMY_SIZE
    enemies.push({
      x: size + Math.random() * (canvas.width - size * 2),
      y: -size,
      w: size * 2,
      h: size * 2,
      speed: type === 'big'
        ? ENEMY_SPEED_MIN * 0.7
        : ENEMY_SPEED_MIN + Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN),
      hp: type === 'big' ? 3 : 1,
      type,
    })
    // Spawn interval decreases with score
    enemyTimer = Math.max(15, 50 - Math.floor(score / 500))
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].y += enemies[i].speed
    if (enemies[i].y > canvas.height + 50) {
      enemies.splice(i, 1)
    }
  }

  // Bullet-enemy collision
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    let hit = false
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (rectsCollide(bullets[bi], enemies[ei])) {
        enemies[ei].hp--
        hit = true
        if (enemies[ei].hp <= 0) {
          spawnParticles(enemies[ei].x, enemies[ei].y, '#f84', 12)
          score += enemies[ei].type === 'big' ? 200 : 50
          enemies.splice(ei, 1)
        } else {
          spawnParticles(bullets[bi].x, bullets[bi].y, '#ff4', 5)
        }
        break
      }
    }
    if (hit) {
      bullets.splice(bi, 1)
    }
  }

  // Player-enemy collision
  for (const e of enemies) {
    if (rectsCollide(player, e)) {
      gameOver = true
      spawnParticles(player.x, player.y, '#f44', 30)
      return
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life--
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
}

// ─── Render ───────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Background
  ctx.fillStyle = '#0a0a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  updateAndDrawStars()

  if (gameOver) {
    // Draw remaining particles
    for (const p of particles) {
      ctx.globalAlpha = p.life / 40
      ctx.fillStyle = p.color
      ctx.fillRect(p.x, p.y, p.size, p.size)
    }
    ctx.globalAlpha = 1

    // Game Over overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#f44'
    ctx.font = `bold ${Math.min(48, canvas.width / 8)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30)

    ctx.fillStyle = '#fff'
    ctx.font = `${Math.min(22, canvas.width / 16)}px sans-serif`
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 25)

    ctx.fillStyle = '#aaa'
    ctx.font = `${Math.min(16, canvas.width / 22)}px sans-serif`
    ctx.fillText('点击屏幕重新开始', canvas.width / 2, canvas.height / 2 + 55)

    return
  }

  // Draw bullets
  for (const b of bullets) {
    drawBullet(b)
  }

  // Draw enemies
  for (const e of enemies) {
    drawEnemy(e)
  }

  // Draw player
  drawPlayer()

  // Draw particles
  for (const p of particles) {
    ctx.globalAlpha = p.life / 40
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, p.size, p.size)
  }
  ctx.globalAlpha = 1

  // HUD
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.min(18, canvas.width / 20)}px sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText(`分数: ${score}`, 12, 30)
}

// ─── Game loop ────────────────────────────────────────
function gameLoop() {
  update()
  render()
  requestAnimationFrame(gameLoop)
}

// ─── Start ────────────────────────────────────────────
requestAnimationFrame(gameLoop)
