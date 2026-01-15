// Collection of shader programs for the app

// Shader 2: Ether by nimitz - smooth flowing gradient (no glow effects)
export const etherShader = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform bool hasActiveReminders;
uniform bool hasUpcomingReminders;
uniform bool disableCenterDimming;
varying vec2 vTextureCoord;

// Ether by nimitz 2014 (twitter: @stormoid)
// https://www.shadertoy.com/view/MsjSW3
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

#define t iTime
mat2 m(float a){float c=cos(a), s=sin(a);return mat2(c,-s,s,c);}
float map(vec3 p, bool isActive, bool isUpcoming){
    p.xz*= m(t*0.4);p.xy*= m(t*0.3);
    vec3 q = p*2.+t;
    return length(p+vec3(sin(t*0.7)))*log(length(p)+1.) + sin(q.x+sin(q.z+sin(q.y)))*0.5 - 1.;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Calculate aspect-corrected UV coordinates
    vec2 p = fragCoord.xy/min(iResolution.x, iResolution.y) - vec2(.9, .5);
    // Shift center for our viewport
    p.x += 0.4;
    
    vec3 cl = vec3(0.);
    float d = 2.5;
    
    // Ray marching loop
    for(int i=0; i<=5; i++) {
        vec3 p3d = vec3(0,0,5.) + normalize(vec3(p, -1.))*d;
        float rz = map(p3d, hasActiveReminders, hasUpcomingReminders);
        float f = clamp((rz - map(p3d+.1, hasActiveReminders, hasUpcomingReminders))*0.5, -.1, 1.);
        
        // Much darker purple with bright purple highlights for perfect gradient
        vec3 baseColor = vec3(0.08, 0.02, 0.06) + vec3(1.2, 0.3, 0.9)*f;
        
        cl = cl*baseColor + smoothstep(2.5, .0, rz)*.7*baseColor;
        d += min(rz, 1.);
    }
    
    // NO MOUSE INTERACTION - NO GLOW EFFECTS
    
    fragColor = vec4(cl, 1.0);
}

void main() {
    vec2 fragCoord = vTextureCoord * iResolution;
    vec4 color;
    mainImage(color, fragCoord);
    gl_FragColor = color;
}
`;

// Original flowing waves shader
export const flowingWavesShader = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform bool hasActiveReminders;
uniform bool hasUpcomingReminders;
uniform bool disableCenterDimming;
varying vec2 vTextureCoord;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

  for(float i = 1.0; i < 10.0; i++){
    uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
    uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
  }
  
  // Purple/pink color for default
  fragColor = vec4(vec3(0.4, 0.1, 0.6) / abs(sin(iTime - uv.y - uv.x)), 1.0);
}

void main() {
  vec2 fragCoord = vTextureCoord * iResolution;
  vec4 color;
  mainImage(color, fragCoord);
  gl_FragColor = color;
}
`;

// Common vertex shader for all shaders
export const vertexShader = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;
void main() {
  gl_Position = aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

// Shader collection for easy access
export const shaders = [
  {
    id: 1,
    name: "Flowing Waves",
    fragmentShader: flowingWavesShader,
    color: "#8b5cf6" // Purple color
  },
  {
    id: 2,
    name: "Ether",
    fragmentShader: etherShader,
    color: "#8b5cf6" // Purple color
  }
];
