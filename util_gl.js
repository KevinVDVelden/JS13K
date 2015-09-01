function setUniforms(program, vars) {
    for ( key in vars ) {
        var uniform = gl.getUniformLocation( program, key );
        var t = typeof vars[key];
        if ( key=='atlas') {
            gl.uniform1i( uniform, vars[key] );
        } else if (t == 'number') {
            gl.uniform1f( uniform, vars[key] );
        } else if ( vars[key].length == 16 ) {
            gl.uniformMatrix4fv( uniform, false, vars[key] )
        } else {
            f = [ 'uniform2fv', 'uniform3fv', 'uniform4fv' ][ vars[ key ].length - 2 ];
            gl[f]( uniform, vars[ key ] );
        }
    }

//uniform vec2 resolution;
//uniform float time;
}
function getArrayBuf( buffer ) {
    var ret = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, ret );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW );

    ret.length = buffer.length;

    return ret;
}


