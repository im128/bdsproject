const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const radSlider = document.getElementById("radiation");
const radValue = document.getElementById("radValue");
const fertSelect = document.getElementById("fertilizer");
const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const aliveText = document.getElementById("alive");
const mutatedText = document.getElementById("mutated");
const timerText = document.getElementById("timer");

radValue.textContent = radSlider.value;
radSlider.oninput = () => radValue.textContent = radSlider.value;

speedValue.textContent = speedSlider.value + "s/year";
let secondsPerYear = Number(speedSlider.value);
speedSlider.oninput = () => {
  secondsPerYear = Number(speedSlider.value);
  speedValue.textContent = secondsPerYear + "s/year";
};

const PLANTS = 10;
let plants = [];
let particles = [];
let years = 0;
let yearTimer = 0;

class RadiationParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = Math.random() - 0.5;
    this.vy = Math.random() + 0.2;
    this.life = 200;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    ctx.fillStyle = "rgba(34,197,94,0.3)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Plant {
  constructor(x) {
    this.x = x;
    this.height = 30;
    this.health = 100;
    this.mutated = false;
    this.dead = false;
    this.wobble = Math.random() * Math.PI;
  }

  update(radiation, fertilizer) {
    if (this.dead) return;

    this.wobble += 0.05;

    let growthBoost = 0, damageScale = 1, mutationBoost = 1;
    if (fertilizer === "organic") growthBoost = 0.4;
    if (fertilizer === "nitrogen") { growthBoost = 0.7; mutationBoost = 1.3; }
    if (fertilizer === "shielded") damageScale = 0.6;

    const growth = Math.max(0.4, 1.2 - radiation / 70) + growthBoost;
    this.height += growth;

    if (!this.mutated && radiation >= 20 && radiation <= 70 &&
        Math.random() < (radiation / 1800) * mutationBoost) {
      this.mutated = true;
    }

    let damage = radiation * 0.015 * damageScale;
    if (this.mutated) damage *= 0.7;

    this.health -= damage;
    if (this.health <= 0) this.dead = true;
  }

  draw() {
    const baseY = canvas.height - 30;
    const sway = Math.sin(this.wobble) * 4;

    ctx.shadowBlur = this.mutated && !this.dead ? 12 : 0;
    ctx.shadowColor = "#c084fc";

    ctx.strokeStyle = this.dead
      ? "#7f1d1d"
      : this.mutated
      ? "#a855f7"
      : "#22c55e";

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, baseY);
    ctx.lineTo(this.x + sway, baseY - this.height);
    ctx.stroke();

    if (!this.dead) {
      ctx.fillStyle = this.mutated ? "#c084fc" : "#4ade80";
      ctx.beginPath();
      ctx.ellipse(this.x + sway - 6, baseY - this.height / 2, 6, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(this.x + sway + 6, baseY - this.height / 2, 6, 3, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function resetGame() {
  plants = [];
  particles = [];
  years = 0;
  yearTimer = 0;
  timerText.textContent = "0";
  for (let i = 0; i < PLANTS; i++) {
    plants.push(new Plant(80 + i * 80));
  }
}

function updateUI() {
  aliveText.textContent = plants.filter(p => !p.dead).length;
  mutatedText.textContent = plants.filter(p => p.mutated && !p.dead).length;
}

let lastTime = performance.now();
function animate(time) {
  const deltaTime = (time - lastTime) / 1000; // seconds
  lastTime = time;

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#052e16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const radiation = Number(radSlider.value);
  const fertilizer = fertSelect.value;

  // Dynamic zoom
  let zoom = 1 - Math.min(years / 100, 0.7);
  ctx.setTransform(zoom, 0, 0, zoom, canvas.width * (1 - zoom) / 2, canvas.height * (1 - zoom) / 2);

  // Radiation particles
  if (particles.length < radiation) particles.push(new RadiationParticle());
  particles.forEach(p => { p.update(); p.draw(); });
  particles = particles.filter(p => p.life > 0);

  // Plants
  plants.forEach(p => { p.update(radiation, fertilizer); p.draw(); });

  updateUI();

  // Year counter
  if (plants.some(p => !p.dead)) {
    yearTimer += deltaTime;
    if (yearTimer >= secondsPerYear) {
      years++;
      yearTimer = 0;
      timerText.textContent = years;
    }
  }

  requestAnimationFrame(animate);
}

resetGame();
animate();
