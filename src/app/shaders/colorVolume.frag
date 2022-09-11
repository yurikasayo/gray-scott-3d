#version 300 es

#define ITERATION 500.0

precision highp float;
precision highp sampler3D;

in vec3 vPos;
in vec3 vCameraPos;
in mat3 vNMatrix;

uniform sampler3D map;
uniform vec3 size;

out vec4 outColor;

vec3 getNormal(vec3 p) {
    float f0 = texture(map, p).g;
    vec2 e = vec2(0.01, 0.0);
    vec3 n = f0 - vec3(texture(map, p+e.xyy).g, texture(map, p+e.yxy).g, texture(map, p+e.yyx).g);
    float epsilon = 0.005;
    
    if ( p.x < epsilon ) n = vec3( -1.0, 0.0, 0.0 );
    if ( p.y < epsilon ) n = vec3( 0.0, -1.0, 0.0 );
    if ( p.z < epsilon ) n = vec3( 0.0, 0.0, -1.0 );
    if ( p.x > 1.0 - epsilon ) n = vec3( 1.0, 0.0, 0.0 );
    if ( p.y > 1.0 - epsilon ) n = vec3( 0.0, 1.0, 0.0 );
    if ( p.z > 1.0 - epsilon ) n = vec3( 0.0, 0.0, 1.0 );

    return normalize(vNMatrix * n);
}

void main() {
    vec3 ray = normalize(vPos - vCameraPos) * length(size);

    outColor = vec4(0.0);
    for (float i = 1.0; i <= ITERATION; i++) {
        vec3 texCoord = vec3(0.5) + vec3(vPos + ray * i / ITERATION) / size;

        if (texCoord.x >= 0.0 && texCoord.x <= 1.0
         && texCoord.y >= 0.0 && texCoord.y <= 1.0
         && texCoord.z >= 0.0 && texCoord.z <= 1.0) {
            vec4 color = texture(map, texCoord);
            // color.a = color.g;
            // color.rgb = vec3(1.0);

            // float cutOffAlpha = alphaScale * step(cutoff, color.a);
            // outColor = color * cutOffAlpha + outColor * (1.0 - cutOffAlpha);
            if (color.g > 0.25) {
                outColor = vec4((ITERATION-i)/ITERATION);
                outColor.rgb = getNormal(texCoord);
                break;
            }
        }
    }
}