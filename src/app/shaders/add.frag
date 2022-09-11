#version 300 es

precision highp float;
precision highp sampler3D;

in vec2 vUv2;

out vec4 outColor[gl_MaxDrawBuffers];

uniform sampler3D map;
uniform float startZ;
uniform vec3 resolution;

uniform vec3 center;
uniform float sourceSize;

vec4 addSource(vec3 p) {
    vec3 d = p - center;
    float intencity = 0.5 * exp(-dot(d, d) / sourceSize);

    vec2 s = texture(map, p).xy;
    s.x = max(0.0, s.x - intencity);
    s.y = min(1.0, s.y + intencity);

    return vec4(s, 0.0, 1.0);
}

void main() {
    vec4 color[gl_MaxDrawBuffers];

    for (int i = 0; i < gl_MaxDrawBuffers; i++) {
        color[i] = addSource(vec3(vUv2, (startZ + float(i) + 0.5) / resolution.z));
    }

    outColor = color;
}