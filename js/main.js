import { Simulation } from './simulation.js';
import { UI } from './ui.js';

window.onload = () => {
    console.log("Window loaded");
    const canvas = document.getElementById('simulation-canvas');
    const sim = new Simulation(canvas);
    const ui = new UI(sim);

    sim.start();
};
