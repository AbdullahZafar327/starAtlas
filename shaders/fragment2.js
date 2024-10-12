const fragment2 = `

uniform float time;
uniform float progress;
uniform vec4 resolution;
uniform sampler2D uTexture;


varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 eyeVector;

float PI = 3.14159265358979323;

//Utils

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

//Other functions
// {........}




//-----------------come here-------------------
void main(){
vec2 screenUv =  gl_FragCoord.xy / resolution.xy;
vec2 newUv = vUv;


vec4 tt = texture2D(uTexture,newUv);
gl_FragColor = vec4(newUv,0.,1.0);
}

`

export default fragment2