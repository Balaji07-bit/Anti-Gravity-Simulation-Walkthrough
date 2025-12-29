export class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.objects = [];
        this.gravity = 1.0;
        this.friction = 0.99;
        this.bounce = 0.7;

        this.isRunning = false;

        // Anti-Gravity Zone
        this.antiGravityZone = {
            active: false,
            x: 0,
            y: 0,
            radius: 150,
            force: -2.0 // Strong upward force
        };

        // Interaction
        this.draggedObj = null;
        this.mouse = { x: 0, y: 0 };

        // Resize listener
        window.addEventListener('resize', () => {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        });

        this.setupInput();
    }

    setupInput() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Check for object click
        for (let obj of this.objects) {
            const dx = this.mouse.x - obj.x;
            const dy = this.mouse.y - obj.y;
            if (dx * dx + dy * dy < obj.radius * obj.radius) {
                this.draggedObj = obj;
                obj.isDragging = true;
                obj.vx = 0;
                obj.vy = 0;
                break;
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        if (this.antiGravityZone.active) {
            this.antiGravityZone.x = this.mouse.x;
            this.antiGravityZone.y = this.mouse.y;
        }
    }

    handleMouseUp() {
        if (this.draggedObj) {
            this.draggedObj.isDragging = false;
            this.draggedObj = null;
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.loop();
        }
    }

    stop() {
        this.isRunning = false;
    }

    addObject(x, y, radius = 20, color = '#64ffda') {
        const obj = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: radius,
            color: color,
            isDragging: false
        };
        this.objects.push(obj);
    }

    clearObjects() {
        this.objects = [];
    }

    setGravity(val) {
        this.gravity = parseFloat(val);
    }

    toggleAntiGravityZone() {
        this.antiGravityZone.active = !this.antiGravityZone.active;
        // In case we toggle it on, set its position to current mouse or center
        if (this.antiGravityZone.active) {
            // If we haven't moved mouse yet, center it
            if (this.mouse.x === 0 && this.mouse.y === 0) {
                this.antiGravityZone.x = this.width / 2;
                this.antiGravityZone.y = this.height / 2;
            } else {
                this.antiGravityZone.x = this.mouse.x;
                this.antiGravityZone.y = this.mouse.y;
            }
        }
        return this.antiGravityZone.active;
    }

    update() {
        for (let obj of this.objects) {
            if (obj.isDragging) {
                // Follow mouse
                obj.x = this.mouse.x;
                obj.y = this.mouse.y;
                obj.vx = 0;
                obj.vy = 0;
                continue;
            }

            // Normal Gravity
            obj.vy += this.gravity * 0.5;

            // Anti-Gravity Zone Interaction
            if (this.antiGravityZone.active) {
                const dx = obj.x - this.antiGravityZone.x;
                const dy = obj.y - this.antiGravityZone.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < this.antiGravityZone.radius * this.antiGravityZone.radius) {
                    const dist = Math.sqrt(distSq);
                    // Force calculation: Stronger at center, weaker at edge
                    const force = (1 - dist / this.antiGravityZone.radius) * 2.0;

                    obj.vy += this.antiGravityZone.force * force; // Upward pull
                    obj.vx += (dx / dist) * force; // Push outward
                }
            }

            // Apply Velocity
            obj.x += obj.vx;
            obj.y += obj.vy;

            // Apply Friction
            obj.vx *= this.friction;
            obj.vy *= this.friction;

            // Wall Collisions
            if (obj.y + obj.radius > this.height) {
                obj.y = this.height - obj.radius;
                obj.vy *= -this.bounce;
            } else if (obj.y - obj.radius < 0) {
                obj.y = obj.radius;
                obj.vy *= -this.bounce;
            }

            if (obj.x + obj.radius > this.width) {
                obj.x = this.width - obj.radius;
                obj.vx *= -this.bounce;
            } else if (obj.x - obj.radius < 0) {
                obj.x = obj.radius;
                obj.vx *= -this.bounce;
            }
        }
    }

    draw() {
        // Trail effect: instead of clearing completely, draw a semi-transparent black rect
        this.ctx.fillStyle = 'rgba(10, 10, 18, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Anti-Gravity Zone
        if (this.antiGravityZone.active) {
            this.ctx.beginPath();
            this.ctx.arc(this.antiGravityZone.x, this.antiGravityZone.y, this.antiGravityZone.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(100, 255, 218, 0.05)';
            this.ctx.strokeStyle = '#64ffda';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.fill();
            this.ctx.closePath();
        }

        for (let obj of this.objects) {
            this.ctx.beginPath();
            this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = obj.color;

            // Glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = obj.color;

            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
}
