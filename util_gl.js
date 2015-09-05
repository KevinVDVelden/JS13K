function setUniforms(program, vars) {
    for ( key in vars ) {
        var uniform = gl.getUniformLocation( program, key );
        var t = typeof vars[key];
        if ( t == 'undefined' ) continue;

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
function getArrayBuf( glBuff, buffer ) {
    if ( glBuff ) {
        var ret = glBuff;
    } else {
        var ret = gl.createBuffer();
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, ret );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW );

    ret.length = buffer.length;

    return ret;
}


function setShader( shaderI ) {
    gl.useProgram( shaders[shaderI][0] );

    setUniforms(shaders[shaderI][0], scene.uniforms);
    setUniforms(shaders[shaderI][0], {'time':scene.time*0.001, 'mvc':scene.mvc});
}

function draw( buf ) {
    if ( buf.length > 0 ) {
        gl.bindBuffer( gl.ARRAY_BUFFER, buf );
        gl.vertexAttribPointer( shaders[TILE_SHADER][1], 3, gl.FLOAT, false, 6*4, 0 );
        gl.vertexAttribPointer( shaders[TILE_SHADER][2], 3, gl.FLOAT, false, 6*4, 3*4 );
        gl.drawArrays( gl.TRIANGLES, 0, buf.length / 6 );
    }
}
