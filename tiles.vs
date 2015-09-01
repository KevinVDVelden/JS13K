attribute vec4 position;
attribute vec2 uv;
uniform mat4 mvc;

varying vec2 v_uv;

void main() {
    gl_Position = vec4( position.xyz, 1.0 ) * mvc;
    v_uv = uv;
}
