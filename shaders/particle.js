const particle = `
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texture1;
attribute vec3 aRandom;
attribute float size;
float PI = 3.141592653589793238;

void main(){
vUv = uv;
vec3 pos = position;
vec4 mvPosition = modelViewMatrix * vec4(pos.xyz,1.);
gl_PointSize = 1000. * (1. / -mvPosition.z);
gl_Position = projectionMatrix * mvPosition;
}
`

export default particle