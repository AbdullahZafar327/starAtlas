const vertex = `
attribute float size;
attribute vec3 customColor;



uniform float time;
uniform float progress;
uniform float focusNear;
uniform float focusFar;
uniform float minOpacity;
uniform float maxOpacity;
uniform float minBlur;
uniform float maxBlur;
uniform float focusFadeOutLength;
uniform float radiusScaleFactor;
uniform float PIXEL_RATIO;
uniform float viewport;


varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

float PI = 3.141592653589793238;


void main(){

vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
vec4 projection = projectionMatrix * mvPosition;

float sizeCalc  = 1.0;

if(-mvPosition.z < focusNear){
   sizeCalc  = smoothstep(focusNear  - focusFadeOutLength , focusNear , -mvPosition.z);

}else if(-mvPosition.z > focusFar){
  sizeCalc  = smoothstep(focusFar  + focusFadeOutLength , focusFar , -mvPosition.z);
}

sizeCalc = (1.0 - sizeCalc);

vAlpha = min(max((1.0 - sizeCalc) * maxOpacity,minOpacity),maxOpacity);

if(vAlpha < 0.00001){
        gl_PointSize = 0.;
        gl_Position.z = 0.0;
}else{
  gl_PointSize = (viewport * (size * PIXEL_RATIO * minBlur + (size * PIXEL_RATIO * maxBlur * sizeCalc))) * radiusScaleFactor;
  vColor = customColor;
  gl_Position = projection;
}


vUv = uv;
}
`

export default vertex