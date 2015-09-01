precision mediump float;
varying vec2 v_uv;

uniform sampler2D atlas;

void main() {
    gl_FragColor = vec4( v_uv,0.0,1.0 );
    gl_FragColor = texture2D( atlas, v_uv );
}
