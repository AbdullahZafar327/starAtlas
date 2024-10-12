const fragment = `

uniform float time;
uniform float progress;
uniform vec4 resolution;
uniform sampler2D pointTexture;
uniform sampler2D pointTextureAlpha;

varying vec3 vColor;
varying float vAlpha;


varying vec2 vUv;


float PI = 3.14159265358979323;

void main(){

vec4 tColor = texture2D(pointTexture,gl_PointCoord);
vec4 tColorAlpha = texture2D(pointTextureAlpha,gl_PointCoord);

tColor.rgb += tColor.rgb * (1.0 - tColor.a);
tColor.rgb += tColorAlpha.rgb * (1.0 - tColorAlpha.a);

gl_FragColor = vec4(vColor,mix(tColorAlpha.a,tColor.a,vAlpha) * vAlpha);
}

`

export default fragment