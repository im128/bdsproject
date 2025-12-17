const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const radSlider = document.getElementById("radiation");
const radValue = document.getElementById("radValue");
const fertSelect = document.getElementById("fertilizer");
const aliveText = document.getElementById("alive");
const mutatedText = document.getElementById("mutated");

radSlider.oninput = () => radValue.textContent = radSlider.value;

const PLANTS = 10;
let plants = [];
let particles = [];

class RadiationParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = Math.random() * 1 - 0.5;
    this.vy = Math.random() * 1 + 0.5;
    this.life = Math.random() * 200;
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

    let growthBoost = 0;
    let damageReduction = 1;
    let mutationBoost = 1;

    if (fertilizer === "organic") {
      growthBoost = 0.4;
    }
    if (fertilizer === "nitrogen") {
      growthBoost = 0.7;
      mutationBoost = 1.3;
    }
    if (fertilizer === "shielded") {
      damageReduction = 0.6;
    }

    const growth = Math.max(0.3, 1.2 - radiation / 70) + growthBoost;
    this.height += growth;

    if (
      !this.mutated &&
      radiation >= 20 &&
      radiation <= 70 &&
      Math.random() < (radiation / 1800) * mutationBoost
    ) {
      this.mutated = true;
    }

    let damage = radiation * 0.015 * damageReduction;
    if (this.mutated) damage *= 0.7;

    this.health -= damage;
    if (this.health <= 0) this.dead = true;
  }

  draw() {
    const baseY = canvas.height - 30;
    const sway = Math.sin(this.wobble) * 4;

    if (this.mutated && !this.dead) {
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowBlur = 0;
    }

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
  for (let i = 0; i < PLANTS; i++) {
    plants.push(new Plant(80 + i * 80));
  }
}

function updateUI() {
  aliveText.textContent = plants.filter(p => !p.dead).length;
  mutatedText.textContent = plants.filter(p => p.mutated && !p.dead).length;
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radiation = Number(radSlider.value);
  const fertilizer = fertSelect.value;

  if (particles.length < radiation * 1.5) {
    particles.push(new RadiationParticle());
  }

  particles.forEach(p => {
    p.update();
    p.draw();
  });
  particles = particles.filter(p => p.life > 0);

  plants.forEach(p => {
    p.update(radiation, fertilizer);
    p.draw();
  });

  updateUI();
  requestAnimationFrame(animate);
}

resetGame();
animate();
