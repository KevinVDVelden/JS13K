//'W'.charCodeAt(0);
/**@const */ KEY_UP = 87;
//'S'.charCodeAt(0);
/**@const */ KEY_DOWN = 83;
//'A'.charCodeAt(0);
/**@const */ KEY_LEFT = 65;
//'D'.charCodeAt(0);
/**@const */ KEY_RIGHT = 68;

/**@const */ TILE_WIDTH = 1;
/**@const */ TILE_HEIGHT = 0.5;

/**@const */ TILESPERMS = 0.012;

canvas = document.body.children[0];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl = canvas.getContext('webgl');

tickI = 0;

loadingCount = 0;
loadingStage = 0;
data = [];
scene = {time:0}
globals = {}

keys = {}
lastKeys = {}

shaders = [];
cv = document.body.children[1];
ctx = cv.getContext('2d');

var BACKGROUND_SHADER=0;
shaders[BACKGROUND_SHADER]=function(){return [[getAjax('bg.fs'),gl.FRAGMENT_SHADER],[getAjax('bg.vs'),gl.VERTEX_SHADER]];}

var TILE_SHADER=1;
shaders[TILE_SHADER]=function(){return [[getAjax('tiles.fs'),gl.FRAGMENT_SHADER],[getAjax('tiles.vs'),gl.VERTEX_SHADER]];}

/**@const */ TILE_FLOOR = 0;
/**@const */ TILE_WALL = 6;

uv = [];

/**@const */ EPSILON = 0.002;
for ( var i = 0; i < 64; i++ ) {
    var x = ( i % 8 );
    var y = ( ( i/8 )|0 );
    uv[i] = [ x*0.125+EPSILON, y*0.125+EPSILON, x*0.125-EPSILON+0.125, y*0.125-EPSILON+0.125 ];
}
uv[2] = uv[0];

window.addEventListener('keyup', function(event) { lastKeys[event.keyCode]=keys[event.keyCode]; keys[event.keyCode] = -scene.time; }, false);
window.addEventListener('keydown', function(event) { lastKeys[event.keyCode]=keys[event.keyCode]; keys[event.keyCode] = scene.time; }, false);
function mouse(event) {
    if ( !scene.onTile ) return;

    if ( !scene.viewInv ) {
        scene.viewInv = M4x4.inverse( scene.view );
    }

    v = [ event.pageX / window.innerWidth * 2 - 1, event.pageY / window.innerHeight * -2 + 1, 1, 1 ];
    v = M4x4.multV( scene.viewInv, v );

    x = ( ( v[0] / TILE_WIDTH ) + ( v[1] / TILE_HEIGHT ) );
    y = ( ( v[1] / TILE_HEIGHT ) - ( v[0] / TILE_WIDTH ) );

    x = Math.round(x);
    y = Math.round(y);
    document.title = x + ', ' + y + ', ' + scene.gameMap[x+y*MAP_SIZE];

    scene.onTile( x, y, event );
};
canvas.addEventListener('mousemove', mouse);
canvas.addEventListener('mousedown', mouse);

function updateImages() {
    var canvas = document.body.children[2];
    var smallCtx = canvas.getContext('2d');

    var imgs = document.getElementsByTagName('img');
    for ( var i = 0; i < imgs.length; i++ ) {
        var img = imgs[i];
        img.style.width='64px';
        img.style.height='64px';

        var off = img.attributes.offset.value.split(' ');
        smallCtx.clearRect(0,0,64,64);
        smallCtx.drawImage( cv, off[0], off[1], 64, 64, 0, 0, 64, 64 );

        img.src=canvas.toDataURL();
    }
    smallCtx.drawImage( cv, 448, 0, 64, 64, 0, 0, 64, 64 );

    document.body.children[3].style.backgroundImage='url("'+canvas.toDataURL()+'")';
    document.body.children[3].style['backgroundSize'] = '30% 100%';

    smallCtx.drawImage( cv, 448, 0, 64, 64, 0, 0, 64, 64 );
    //smallCtx.drawImage( cv, 384, 0, 64, 52, 0, 0, 64, 64 );

    document.body.children[4].children[0].style.backgroundImage='url("'+canvas.toDataURL()+'")';
    document.body.children[4].children[0].style['backgroundSize'] = '64px 100%';
}
function setScene(name) {
    document.body.children[3].innerHTML = data[name];

    updateImages();
}
window['setScene']=setScene;
function startGame(settings) {
    updateImages();
    game.settings = settings;
    scene.next = game;
    document.body.children[3].style.display = 'none';
}
window['startGame']=startGame;

setTimeout( 'startGame([])', 1000 );

scene.render = function( time ) {
    if ( loadingStage > 50 ) {
        setShader( BACKGROUND_SHADER );
        gl.bindBuffer( gl.ARRAY_BUFFER, globals.fullScreenBuffer );
        gl.disableVertexAttribArray(1);
        gl.vertexAttribPointer( shaders[BACKGROUND_SHADER][1], 3, gl.FLOAT, false, 0, 0 );
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
    }

    switch ( loadingStage ) {
        case 0: {
            getAjax( 'intro.html' );
            getAjax( 'menu.html' );
            getAjax( 'about.html' );
        } break;
        case 1: {
            if ( loadingCount == 0 ) {
                setScene('menu.html');
            } else {
                return;
            }
        } break;
        case 11: {
            id = ctx.createImageData( 64, 64 );
            d=id.data;
            renderImages( id, d );
        } break;
        case 12: {
            var canvas = document.body.children[2];
            var smallCtx = canvas.getContext('2d');

            smallCtx.drawImage( cv, 448, 0, 64, 64, 0, 0, 64, 64 );

            document.body.children[3].style.backgroundImage='url("'+canvas.toDataURL()+'")';
            document.body.children[3].style['backgroundSize']='30% 100%';
        } break;
        case 20: {
            globals.atlas = gl.createTexture();
            gl.bindTexture( gl.TEXTURE_2D, globals.atlas );
            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.getImageData(0,0,512,512) );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, globals.atlas);
            gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
            gl.enable( gl.BLEND );
        } break;
        case 30: {
            for ( key in shaders ) shaders[key] = shaders[key]();
        } break;
        case 31: {
            if ( loadingCount <= 0 ) {
                //Init shaders
                for ( var i = 0; shaders[i]; i++ ) {
                    shaderProgram = gl.createProgram();
                    for ( var j = 0; shaders[i][j]; j++ ) {
                        shader = gl.createShader( shaders[i][j][1] );
                        gl.shaderSource(shader, data[ shaders[i][j][0] ] );
                        gl.compileShader(shader);

                        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                            console.log("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
                        }
                        gl.attachShader( shaderProgram, shader );
                    }
                    gl.linkProgram( shaderProgram );

                    gl.useProgram(shaderProgram);

                    var vertex = gl.getAttribLocation( shaderProgram, 'position' );
                    var uv = gl.getAttribLocation( shaderProgram, 'uv' );

                    shaders[i] = [ shaderProgram, vertex, uv ];
                }
            } else {
                return;
            }
        } break;
        case 40: {
            globals.fullScreenBuffer = getArrayBuf(null, [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]);
        } break;
        case 50: {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            this.uniforms = { 'resolution':[ this.width, this.height ], 'aspect':[ 1.0, this.aspect ], 'atlas': 0 };
            gl.enableVertexAttribArray(0);


        } break;
        case 51:
            return;
        default: {
            loadingStage += 1;
            scene.render();
            return;
        }
    }

    loadingStage += 1;
}

function setSize(scene) {
    scene.width = canvas.width;
    scene.height = canvas.height;

    if (scene.size) scene.size();
}

accumelator = 0;
onFrame = function(t) {
    requestAnimationFrame(onFrame);

    setSize(scene);

    scene.delta = t - scene.time;
    scene.lastTime = scene.time;
    scene.time = t;

    scene.render(t);
    accumelator += scene.delta;
    if ( accumelator > 100 ) {
        if ( scene.tick ) {
            scene.tick();
            tickI += 1;
            if ( tickI > 1000 ) tickI = 0;
        }
        accumelator -= 100;
    }

    if (scene.next) {
        setSize(scene.next);

        scene.next.delta = scene.delta;
        scene.next.lastTime = scene.lastTime;
        scene.next.time = scene.time;

        var curScene = scene;
        scene = scene.next;

        if (scene.init) {
            scene.init();
        }

        scene.parent = curScene;
    }
}
requestAnimationFrame(onFrame);

game = bindRecursive({
    camX: 0,
    camY: MAP_SIZE,

    updateBuffer:function() {
        if ( this.gameBuffer )
            gl.deleteBuffer( this.gameBuffer[0] );

        var gameBuffer = [];
        var wallBuffer = [];

        var i = -1;
        for (var y = 0; y < MAP_SIZE; y++ ) {
            for (var x = 0; x < MAP_SIZE; x++ ) {
                i += 1;

                if ( this.gameMap[i] == 0 )
                    continue;

                var _x = ( x - y ) * 0.5;
                var _y = ( x + y ) * 0.25;

                hh = this.gameMap[ i + MAP_SIZE + 1 ] == 0;
                uvHH = hh ? 0 : (2/3)/8;
                hh = hh ? 0.5 : 0;
                if ( this.gameMap[i + MAP_SIZE ] == 0 ) {
                    _uv = uv[TILE_WALL];
                    wallBuffer = [
                            _x-0.5,  _y,        0,  _uv[0], _uv[3], 1, //B
                            _x,      _y+0.25,   0,  _uv[2], _uv[3], 1, //A
                            _x-0.5,  _y+0.25+hh,0,  _uv[0], _uv[1]+uvHH, 1, //B+

                            _x-0.5,  _y+0.25+hh,0,  _uv[0], _uv[1]+uvHH, 1, //C
                            _x,      _y+0.25,   0,  _uv[2], _uv[3], 1, //A
                            _x,      _y+0.5+hh, 0,  _uv[2], _uv[1]+uvHH, 1, //A+
                    ].concat( wallBuffer );
                }
                if ( this.gameMap[i + 1] == 0 ) {
                    _uv = uv[TILE_WALL];
                    wallBuffer = [
                            _x+0.5,  _y,        0,  _uv[2], _uv[3], 1, //B
                            _x,      _y+0.25,   0,  _uv[0], _uv[3], 1, //A
                            _x+0.5,  _y+0.25+hh,0,  _uv[2], _uv[1]+uvHH, 1, //C

                            _x+0.5,  _y+0.25+hh,0,  _uv[2], _uv[1]+uvHH, 1, //C
                            _x,      _y+0.25,   0,  _uv[0], _uv[3], 1, //A
                            _x,      _y+0.5+hh, 0,  _uv[0], _uv[1]+uvHH, 1, //B
                    ].concat( wallBuffer );
                }

                /**
                 * A(0,0)   C(1,0)
                 *
                 * B(0,1)   D(1,1)
                 *
                 *
                 *      A(0,0)
                 *
                 *  B(0,1)  C(1,0)
                 *
                 *      D(1,1)
                 **/
                _uv = uv[this.gameMap[i]-1];
                gameBuffer = gameBuffer.concat( [
                        _x-0.5,  _y,      0,  _uv[0], _uv[3], 1, //B
                        _x,      _y+0.25, 0,  _uv[2], _uv[3], 1, //A
                        _x+0.5,  _y,      0,  _uv[2], _uv[1], 1, //C

                        _x+0.5,  _y,      0,  _uv[2], _uv[1], 1, //C
                        _x,      _y-0.25, 0,  _uv[0], _uv[1], 1, //D
                        _x-0.5,  _y,      0,  _uv[0], _uv[3], 1, //B
                ] );
            }
        }

        this.gameBuffer = getArrayBuf( this.gameBuffer, gameBuffer );
        this.wallBuffer = getArrayBuf( this.wallBuffer, wallBuffer );
    },

    setCamera:function(x,y) {
        this.camX = x;
        this.camY = y;
    },

    addEntity:function( x,y, statsMax, tags, funcs ) {
        if ( tags == undefined && funcs == undefined ) {
            tags = statsMax[1];
            funcs = statsMax[2];
            statsMax = statsMax[0];
        }

        var ent = [ x, y, 0, 0, [], [], [], [], funcs ];
        for ( var i in statsMax ) {
            ent[ENTITY_ATTRIBUTE][i] = statsMax[i][0];
            ent[ENTITY_MAX_ATTRIBUTE][i] = [ statsMax[i][1], statsMax[i][2] ];
            ent[ENTITY_CHANGE_ATTRIBUTE][i] = statsMax[i][3];
        }
        for ( var i in tags ) ent[ENTITY_TAGS][i] = tags[i];

        ent[ENTITY_TAGS][TAG_TILE_BASE] = ent[ENTITY_TAGS][TAG_TILE];

        this.entities[this.entities.length] = ent;
        return ent;
    },

    entsAtPos:function( x, y ) {
        var ret = [];
        for ( var i = 0; i < this.entities.length; i++ ) {
            if ( Math.abs( this.entities[i][0]-x ) + Math.abs( this.entities[i][1]-y ) < 1 ) {
                ret[ret.length] = this.entities[i];
            }
        }

        return ret;
    },

    init:function() {
        while ( true ) {
            var gameMap = [];
            this.gameMap = gameMap;
            for ( ;gameMap.length<MAP_SIZE*MAP_SIZE;gameMap[gameMap.length]=0 ) {}

            this.entities = [];

            function addRoom( _x, _y, w, h, ent ) {
                for ( var x = _x-w; x <= _x+w; x++ )
                    for ( var y = _y-h; y <= _y+h; y++ )
                        gameMap[y*MAP_SIZE+x] = 1;

                scene.addEntity( _x, _y, ent );
            }


            var roomTypes = [ LOOT[0], LOOT[1], LOOT[2], EXIT_BASE ];
            var types = [ 0, 0, 0, 0 ];

            for ( var x = 64 - 12; x <= 64 + 12; x++ ) {
                for ( var y = 64 - 12; y <= 64 + 12; y++ ) {
                    this.gameMap[ y * MAP_SIZE + x ] = 2;
                }
            }

            entranceX = ( Math.random() * 3 ) | 0 - 1;
            entranceY = ( Math.random() * 3 ) | 0 - 1;

            addRoom( 64 + entranceX * 6, 64 + entranceY * 6, 2, 2, ENTRANCE_BASE );

            for ( var x = -2; x < 3; x++ ) {
                for ( var y = -2; y < 3; y++ ) {
                    if ( x == entranceX && y == entranceY ) continue;

                    var i = Math.floor( Math.random() * roomTypes.length );
                    types[ i ] += 1;
                    var w = 1, h = 1;
                    if ( Math.random() > 0.7 ) if ( Math.random() > 0.5 ) w = 2; else h = 2;
                    addRoom( 64 + x * 6, 64 + y * 6, w, h, roomTypes[ i ] );
                }
            }
            //this.addEntity( 64, 64, THIEF_BASE );
            //this.addEntity( 64, 64, TRAP_BASES[0] );
            //this.addEntity( 65, 64, TRAP_BASES[1] );
            //this.addEntity( 64, 65, TRAP_BASES[2] );

            if ( types[ 3 ] == 0 || types[ 3 ] > 2 ) {
                console.log( 'Disbanding generation, trying again.' );
                continue; //Ensure not too many exits
            }

            this.verify = function() {
                var map = new Flowmap( scene.gameMap );
                map.addTarget( 64 + entranceX * 6, 64 + entranceY * 6 );

                for ( var x = -2; x < 3; x++ ) {
                    for ( var y = -2; y < 3; y++ ) {
                        if ( x == entranceX && y == entranceY ) continue;
                        console.log( 64 + x * 6, 64 + y * 6 );
                        if ( !map.directionFrom( 64 + x * 6, 64 + y * 6 ) ) return false;
                    }
                }
                return true;
            }

            break;
        }
        this.updateBuffer();
    },

    tick:function() {
        var mapDirty = false;
        for ( var i = 0; i < this.entities.length; i++ ) {
            var ent = this.entities[i];

            for ( var thinkI = 0; thinkI < ent[ENTITY_THINK].length; thinkI++ ) {
                ent[ENTITY_THINK][thinkI]( this, ent );
            }

            if ( ent[ENTITY_TAGS][TAG_TILE] ) {
                var I = ent[ENTITY_Y] * MAP_SIZE + ent[ENTITY_X];
                if ( this.gameMap[I] != ent[ENTITY_TAGS][TAG_TILE] ) {
                    this.gameMap[I] = ent[ENTITY_TAGS][TAG_TILE];
                    mapDirty = true;
                }
            }
        }
        for ( var i = 0; i < this.entities.length; i++ ) {
            var ent = this.entities[i];

            for ( var attrI in ent[ENTITY_ATTRIBUTE] ) {
                ent[ENTITY_ATTRIBUTE][attrI] = Math.min(
                        ent[ENTITY_MAX_ATTRIBUTE][attrI][1],
                        Math.max( ent[ENTITY_MAX_ATTRIBUTE][attrI][0],
                            ent[ENTITY_ATTRIBUTE][attrI] + ent[ENTITY_CHANGE_ATTRIBUTE][attrI] ) );

            }
        }
        if ( mapDirty ) {
            this.updateBuffer();
        }

        entBuffer = [];
        for ( var i = 0; i < this.entities.length; i++ ) {
            ent = this.entities[i];

            function add( x, y, _uv, alpha ) {
                var _x = ( x - y ) * 0.5;
                var _y = ( x + y ) * 0.25;
                _uv = uv[ _uv ];

                entBuffer = entBuffer.concat( [
                        _x - 0.45, _y - 0.45, 0, _uv[0], _uv[3], alpha, //A
                        _x - 0.45, _y + 0.45, 0, _uv[0], _uv[1], alpha, //B
                        _x + 0.45, _y - 0.45, 0, _uv[2], _uv[3], alpha, //C

                        _x + 0.45, _y + 0.45, 0, _uv[2], _uv[1], alpha, //D
                        _x - 0.45, _y + 0.45, 0, _uv[0], _uv[1], alpha, //B
                        _x + 0.45, _y - 0.45, 0, _uv[2], _uv[3], alpha, //C
                ] );
            }

            if ( ent[ENTITY_TAGS][TAG_ICON] ) {
                add( ent[0], ent[1] + 0.2, ent[ENTITY_TAGS][TAG_ICON], 1 );
            }
            if ( ent[ENTITY_TAGS][TAG_TILE_ICON] > 0 ) {
                add( ent[0], ent[1], ent[ENTITY_TAGS][TAG_TILE_ICON], 1 );
            }
            if ( ent[ENTITY_TAGS][TAG_THOUGHT] > 0 ) {
                add( ent[0]+1.8, ent[1]+0.8, ent[ENTITY_TAGS][TAG_THOUGHT], ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] );
            }
        }
        this.entBuffer = getArrayBuf( this.entBuffer, entBuffer );
    },

    size:function() {
        gl.viewport(0,0,this.width,this.height);
        this.aspect = window.innerWidth / window.innerHeight;
        this.uniforms = { 'resolution':[ this.width, this.height ], 'aspect':[ 1.0, this.aspect ], 'atlas': 0 };
        this.perspective = M4x4.makeOrtho( -10, 10, -10/this.aspect, 10/this.aspect, 0.1, 100.0 );
        this.perspectiveInv = M4x4.inverse( this.perspective );

        this.rotMatrix = M4x4.makeRotate( Math.PI/180*60, [1,0,0] );
        this.rotMatrixInv = M4x4.makeRotate( Math.PI/180*-60, [1,0,0] );
    },

    render:function(time) {
        var deltaX = 0; deltaY = 0;

        if (keys[KEY_DOWN]>0) { deltaY -= 4; }
        if (keys[KEY_UP]>0) { deltaY += 4; }
        if (keys[KEY_LEFT]>0) { deltaX -= 1; }
        if (keys[KEY_RIGHT]>0) { deltaX += 1; }

        if ( this.delta ) {
            this.camX += deltaX * this.delta * TILESPERMS;
            this.camY += deltaY * this.delta * TILESPERMS;

            this.camY = Math.min( 160, Math.max( 100, this.camY ) );
            this.camX = Math.min( 10, Math.max( -10, this.camX ) );
        }

        this.view = M4x4.translate3(-this.camX,-this.camY/4,-10, this.perspective );
        this.viewInv = null;
        this.mvc = M4x4.flip(this.view);

        gl.disableVertexAttribArray(1);
        setShader( BACKGROUND_SHADER );
        gl.bindBuffer( gl.ARRAY_BUFFER, globals.fullScreenBuffer );
        gl.vertexAttribPointer( shaders[BACKGROUND_SHADER][1], 3, gl.FLOAT, false, 0, 0 );
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
        gl.enableVertexAttribArray(1);

        setShader( TILE_SHADER );
        draw( this.gameBuffer );
        draw( this.wallBuffer );
        if ( this.entBuffer ) draw( this.entBuffer );
    },

    onTile:function( x, y, e ) {
        if ( e.type == 'mousedown' ) {
            inputs = document.getElementsByTagName( 'input' );
            selected = '';
            for ( var i = 0; i < inputs.length; i++ ) {
                if ( inputs[i].checked ) {
                    selected = inputs[i].value;
                    break;
                }
            }

            var tileI = x + y * MAP_SIZE;
            var t;
            switch ( selected ) {
                case 'floor':
                    t = scene.gameMap[ tileI ];
                    //console.log( x, y, tileI, t );
                    scene.gameMap[ tileI ] = ( t == 2 ) ? 3 : ( t == 3 ? 2 : t );
                    break;
            }

            console.log( this.verify() );
            this.updateBuffer();
        }
    }
});
