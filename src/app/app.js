import GUI from 'lil-gui';
import * as Stats from 'stats-js';
import { Renderer } from './webgl/renderer';
import { Display } from './display';
import { Simulator } from './simulator';

export class MyApp {
    constructor(canvas, debug) {
        this.canvas = canvas;
        this.debug = debug;

        this.setSize();

        this.renderer = new Renderer(canvas);
        this.display = new Display(this.renderer, canvas.width, canvas.height);
        
        const textureSize = {
            width: 128,
            height: 128,
            depth: 128,
        };
        this.simulator = new Simulator(this.renderer, textureSize);

        this.mouse = {x: 0, y: 0, dx: 0, dy: 0, down: false};
        window.addEventListener('resize', this.resize.bind(this));
        this.canvas.addEventListener('mousemove', e => this.mousemove(e));
        this.canvas.addEventListener('mousedown', this.mousedown.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseup.bind(this));
        this.canvas.addEventListener('touchmove', e => this.touchmove(e));

        this.setGui();
        if (this.debug) {
            this.setStats();
        }

        this.loop();
    }

    setSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.canvas.width = Math.floor(width * pixelRatio);
        this.canvas.height = Math.floor(height * pixelRatio);

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    resize() {
        this.setSize();
        this.renderer.resize(this.canvas.width, this.canvas.height);
        this.display.resize(this.canvas.width, this.canvas.height);
    }

    mousemove(e) {
        this.mouse.x = e.x / window.innerWidth;
        this.mouse.y = (window.innerHeight - e.y) / window.innerHeight;
        this.mouse.dx = e.movementX;
        this.mouse.dy = -e.movementY;

        if (this.mouse.down == true) {
            this.display.rotation.dtheta = -Math.PI * this.mouse.dx / window.innerWidth;
            this.display.rotation.dphi = Math.PI * this.mouse.dy / window.innerHeight;
        }
    }

    mousedown() {
        this.mouse.down = true;
    }

    mouseup() {
        this.mouse.down = false;
    }

    touchmove(e) {
        e.preventDefault();
        const touches = e.touches;

        if (touches.length == 1) {
            const x = touches[0].pageX;
            const y = window.innerHeight - touches[0].pageY;
            
            this.mouse.dx = x - this.mouse.x;
            this.mouse.dy = y - this.mouse.y;
            this.mouse.x = x;
            this.mouse.y = y;

            this.display.rotation.dtheta = -Math.PI * this.mouse.dx / window.innerWidth;
            this.display.rotation.dphi = Math.PI * this.mouse.dy / window.innerHeight;
        }
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));

        if (this.debug) {
            this.stats.end();
            this.stats.begin();
        }
        this.simulator.simulate();

        this.display.updateCamera();
        this.display.setTexture(this.simulator.source.texture);
        this.display.render();
    }

    setGui() {
        this.gui = new GUI();
        this.gui.add(this.simulator.param, "D1").min(0.1).max(0.18).step(0.001);
        this.gui.add(this.simulator.param, "D2").min(0.05).max(0.15).step(0.001);
        this.gui.add(this.simulator.param, "f").min(0.025).max(0.055).step(0.0001);
        this.gui.add(this.simulator.param, "k").min(0.05).max(0.08).step(0.0001);
        this.gui.add(this.simulator.param, "steps").min(1).max(20).step(1);
        this.gui.add(this.simulator.param, "reset");
    }

    setStats() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        this.stats.dom.style.pointerEvents = 'none';
        this.stats.dom.style.userSelect = 'none';
        document.body.appendChild(this.stats.dom);
    }
}