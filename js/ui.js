export class UI {
    constructor(simulation) {
        this.sim = simulation;

        this.gravitySlider = document.getElementById('gravity-slider');
        this.gravityValue = document.getElementById('gravity-value');
        this.btnSpawn = document.getElementById('btn-spawn');
        this.btnClear = document.getElementById('btn-clear');

        this.setupListeners();
    }

    setupListeners() {
        // Gravity Slider
        this.gravitySlider.addEventListener('input', (e) => {
            const val = e.target.value;
            this.sim.setGravity(val);
            this.gravityValue.textContent = `${val}g`;
        });

        // Spawn Button
        this.btnSpawn.addEventListener('click', () => {
            this.spawnRandom();
        });

        // Clear Button
        this.btnClear.addEventListener('click', () => {
            this.sim.clearObjects();
        });

        // Anti-Gravity Zone Toggle
        const btnAntiGravity = document.getElementById('btn-anti-gravity');
        btnAntiGravity.addEventListener('click', () => {
            const active = this.sim.toggleAntiGravityZone();
            btnAntiGravity.classList.toggle('active', active);
            btnAntiGravity.textContent = active ? "Deactivate Anti-Gravity Zone" : "Activate Anti-Gravity Zone";

            if (active) {
                btnAntiGravity.style.background = "#64ffda";
                btnAntiGravity.style.color = "#0a0a12";
            } else {
                btnAntiGravity.style.background = "";
                btnAntiGravity.style.color = "";
            }
        });

        // Canvas Click to Spawn
        this.sim.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = this.sim.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.sim.addObject(x, y);
        });
    }

    spawnRandom() {
        const x = Math.random() * this.sim.width;
        const y = Math.random() * (this.sim.height / 2); // Top half
        this.sim.addObject(x, y);
    }
}
