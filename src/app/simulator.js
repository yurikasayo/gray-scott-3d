import { Framebuffer } from './webgl/framebuffer';
import { Plane } from './webgl/plane';
import { Shader } from './webgl/shader';

import vertexShader from './shaders/simulate.vert';
import simulateShader from './shaders/simulate.frag';
import addShader from './shaders/add.frag';

export class Simulator {
    constructor(renderer, size) {
        this.renderer = renderer;

        this.size = size;
        this.source = new Framebuffer(this.renderer, this.size.width, this.size.height, this.size.depth, true, [1.0, 0.0, 0.0, 0.0]);

        this.plane = new Plane(this.renderer, 2, 2);

        this.shader = new Shader(this.renderer, vertexShader, simulateShader);
        this.shader.createAttributes({position: 3, uv2: 2});
        this.shader.createUniforms({
            startZ: 'float',
            resolution: 'vec3',
            map: 'sampler3D',
            D: 'vec2',
            f: 'float',
            k: 'float',
        });

        this.addShader = new Shader(this.renderer, vertexShader, addShader);
        this.addShader.createAttributes({position: 3, uv2: 2});
        this.addShader.createUniforms({
            startZ: 'float',
            resolution: 'vec3',
            map: 'sampler3D',
            center: 'vec3',
            sourceSize: 'float',
        });

        const that = this;
        this.param = {
            D1: 0.15,
            D2: 0.08,
            f: 0.04,
            k: 0.06,
            steps: 1,
            sourceSize: 0.0005,
            reset() {
                that.reset();
            },
        }

        this.addSource();
    }

    resize(size) {
        this.size = size;
        this.source.resize(size.width, size.height);
    }

    reset() {
        this.source.clearColor([1.0, 0.0, 0.0]);
        this.addSource();
    }

    addSource() {
        for (let i = 0; i < 5; i++) {
            const center = [Math.random(), Math.random(), Math.random()]
            const uniforms = {
                map: this.source.texture,
                center: center,
                sourceSize: this.param.sourceSize,
            };
            this.renderer.set(this.plane, this.addShader, uniforms);
            this.source.render();
        }
    }

    simulate() {
        for (let i = 0; i < this.param.steps; i++) {
            const uniforms = {
                map: this.source.texture,
                D: [this.param.D1, this.param.D2],
                f: this.param.f,
                k: this.param.k,
            };
            this.renderer.set(this.plane, this.shader, uniforms);
            this.source.render();
        }
    }
}