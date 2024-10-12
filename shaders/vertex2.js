const vertex2 = `
uniform float time;
uniform float progress;


varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;


float PI = 3.141592653589793238;


void main(){

vec3 newPos = position;
vec4 modelPosition  = modelMatrix * vec4(newPos,1.0);
vec4 viewPosition = viewMatrix * modelPosition;
vec4 projection = projectionMatrix * viewPosition;

gl_Position = projection;


vUv = uv;
vPosition = viewPosition.xyz;
vNormal = normalize(normalMatrix * normal);
eyeVector = normalize(modelPosition.xyz - cameraPosition);


}
`

export default vertex2