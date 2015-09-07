function renderImages( id, d ) {
    function runImage(cb) {
        var i = 0;
        for ( var y = 0; y < 64; y++ ) {
            for ( var x = 0; x < 64; x++ ) {
                cb(x,y,i);
                i += 4;
            }
        }
    }
    function set(i,r,g,b,a) {
        d[i+0] = r;
        d[i+1] = g;
        d[i+2] = b;
        if (a==undefined) a = 255;
        d[i+3] = a;
    }

    function addNoise(i, strength) {
        n = ( ( rnd.rand() - 0.5 ) * strength ) | 0;
        d[i+0]+=n;
        d[i+1]+=n;
        d[i+2]+=n;
    }
    function put( i ) {
        ctx.putImageData( id, 64*(i%8), 64*((i/8)|0) );
        for ( var _i = 0; _i < d.length; _i++ ) d[_i] = 0;
    }

    floorCrossWidth = 6;
    floorSquareDistance = 15;
    function test(x,y,i,r,g,b) {
        if ( Math.abs( ( 64 - x ) - y ) < floorCrossWidth ||
                Math.abs( x - y ) < floorCrossWidth ||
                ( x > floorSquareDistance && x < (64-floorSquareDistance) && y > floorSquareDistance && y < (64-floorSquareDistance) ) ) {
            set(i,r,g,b);
        }
    }

    //VR tile
    runImage( function( x,y,i ) {
        set( i, x < 2 ? 255 : 0, y < 2 ? 255 : 30, 30 );
    } );
    put( 1 ); //64, 0

    //Floor
    rnd = lcg();rnd.setSeed(46);
    floorI = 0;
    function floor( r1,g1,b1, r2,g2,b2, test, f ) {
        runImage( function( x,y,i ) {
            set( i,r1,g1,b1 );
            test(x+1,y+2,i,123,127,131);
            test(x-1,y-2,i,203,207,211);
            test(x,y,i,r2,g2,b2);

            if (f) f(x,y,i);

            addNoise(i,10);
        } );

        put( floorI );
        floorI += 1;
    }
    floor( 195,195,204, 173,177,181, test );

    floorI += 2;
    floorCrossWidth = 3;
    floorSquareDistance = 16;
    function test2(x,y,i,r,g,b) {
        if ( Math.abs( ( 64 - x ) - y ) < floorCrossWidth ||
                Math.abs( x - y ) < floorCrossWidth ||
                ( (y-32)*(y-32)+(x-32)*(x-32) < floorSquareDistance*floorSquareDistance ) ) {
            set(i,r,g,b);
        }
    }
    floorI = 8;
    floor( 195,195,204, 103,207,191, test2 ); //Tile entrance
    floor( 195,195,204, 207,103,101, test2 ); //Tile exit
    floor( 195,195,204, 50,50,50, test2 ); //Disabled porter
    floorSquareDistance = 18;
    function test3(x,y,i,r,g,b) {
        var c = Math.round( Math.sqrt( (y-32)*(y-32)+(x-32)*(x-32) ) );
        if ( ( ( Math.abs( ( 64 - x ) - y ) < floorCrossWidth || Math.abs( x - y ) < floorCrossWidth ) && c > floorSquareDistance-1 ) ||
                ( c < floorSquareDistance && c % 8 < 5 ) ) {
            set(i,r,g,b);
        }
    }
    floor( 195,195,204, 103,207,191, test3 ); //Freeze trap
    floor( 195,195,204, 207,103,101, test3 ); //Alarm trap
    floor( 195,195,204, 207,193,101, test3 ); //Zap trap
    floor( 195,195,204, 50,50,50, test3 ); //Disabled trap
    floor( 195,195,204, 100,100,100, test3 ); //Disabled trap
    /*
    floorSquareDistance = 18;
    function test4(x,y,i,r,g,b) {
        var c = Math.round( Math.abs(y-32)+Math.abs(x-32) );
        if ( ( ( Math.abs( ( 64 - x ) - y ) < floorCrossWidth || Math.abs( x - y ) < floorCrossWidth ) && c > floorSquareDistance-1 ) ||
                ( c < floorSquareDistance && c % 12 < 6 ) ) {
            set(i,r,g,b);
        }
    }
    floor( 195,195,204, 103,207,191, test4 ); //?? trap
    floor( 195,195,204, 207,103,101, test4 ); //?? trap
    floor( 195,195,204, 207,193,101, test4 ); //?? trap
    floor( 195,195,204, 50,50,50, test4 ); //Disabled trap type 2
    */

    //Wall
    runImage( function( x,y,i ) {
        set(i,173-y*1.5,177-y*1.5,181-y*1.5);

        if ( y > 41 && y < 51 ) {
            var c = ( y - 44 ) - ( Math.sin( x * 0.5 ) * 3 ) | 0;
            c = c > 0 && c < 3;
            set( i, c?225:10, c?225:40, c?225:185 );
            addNoise( i, 50 );
        }
        addNoise( i, 10 );
    } );
    put( 6 ); //128, 0

    //Wall 2
    runImage( function( x,y,i ) {
        set(i,173-y,177-y,181-y);
        addNoise( i, 10 );
    } );
    put( 7 ); //0, 128

    colors = [
        [0.1,0.9,1.0,18*18,12], [0.2,1.0,0.8,20*20,16], [0.1,0.5,0.8,16*16,12], [0.2,0.5,0.8,18*18,14],
        [1.0,0.4,0.1,18*18,12], [0.8,0.5,0.2,20*20,16], [0.8,0.2,0.1,16*16,12], [0.7,0.2,0.1,18*18,14],
    ];

    //Characters
    for ( var colorI in colors ) {
        color = colors[colorI];

        runImage( function( x,y,i ) {
            _x = Math.abs(x - 32);
            _y = y-30;
            var _in = ( y > 4 && y < 60 ) ? ( Math.max( y > 20 ? color[4] - _x : 0, ( color[3] - (_x*_x+_y*_y) ) * 0.9 ) ): -1 ;
            var colorStrength = _in * 10 + 30;

            if (colorStrength>255) colorStrength = Math.sqrt(colorStrength - 255) * 10 + 255;

            set( i, color[0] * colorStrength, color[1] * colorStrength, color[2] * colorStrength, _in > 0 ? 255 : 0 );
            if ( _in > 0 ) {
                if ( ( y > 20 && y < 24 && _x > 5 && _x < 9 ) || ( y == 35 && _x < 6 ) ) {
                    set( i, 0,0,0, 255 );
                }
                addNoise( i , 35 );
            }
        } );

        put( colorI|0 + 3 * 8 );
    }

    //Thought bubbles
    bubbles = [ 4,54,3, 14,44,6, 44,32,16, 41,16,14, 20,26,11, 23,14,8 ];
    texts = [ '', 1, 0, //Empty...
    '%F0%9F%98%A8', 2.5, 5, //Angry
    'X_X', 1.5, 8, //Knocked out
    'zzzZZ', 1.5, 15, //Sleeping
    '%E2%98%B9', 2.5, 5, //Unhappy
    '%E2%98%BA', 3.5, 10, //Happy
    ':|', 2.5, 0, //Happy
    ]

    function sphere(x,y,i,radius,r,g,b) {
        if ( x*x+y*y < radius*radius ) {
            set(i,r,g,b);
        }
    }

    for ( var t = 0; t < texts.length; t+= 3 ) {
        for ( var bubbleI = 0; bubbleI < bubbles.length; bubbleI+=3 ) {
            runImage(function( x, y, i ) {
                _x=x-bubbles[bubbleI+0];
                _y=y-bubbles[bubbleI+1];

                sphere(_x-2,_y,i,bubbles[bubbleI+2],0,0,0);
                sphere(_x+2,_y,i,bubbles[bubbleI+2],0,0,0);
                sphere(_x,_y-2,i,bubbles[bubbleI+2],0,0,0);
                sphere(_x,_y+2,i,bubbles[bubbleI+2],0,0,0);
            } );
        }
        for ( var bubbleI = 0; bubbleI < bubbles.length; bubbleI+=3 ) {
            runImage(function( x, y, i ) {
                _x=x-bubbles[bubbleI+0];
                _y=y-bubbles[bubbleI+1];

                sphere(_x,_y,i,bubbles[bubbleI+2],235,235,235);
                addNoise( i, 20 );
            } );
        }
        ctx.save();
        ctx.scale(texts[t+1], texts[t+1]);
        text = decodeURIComponent( texts[t] );

        var _t = t/3;
        put( _t + 4 * 8 );
        ctx.fillText( text, ( _t*64+28 - texts[t+2] ) / texts[t+1], ( 4*64+28 ) / texts[t+1] );
        ctx.fillText( text, ( _t*64+29 - texts[t+2] ) / texts[t+1], ( 4*64+28 ) / texts[t+1] );
        ctx.fillText( text, ( _t*64+28 - texts[t+2] ) / texts[t+1], ( 4*64+29 ) / texts[t+1] );
        ctx.fillText( text, ( _t*64+29 - texts[t+2] ) / texts[t+1], ( 4*64+29 ) / texts[t+1] );
        ctx.restore();
    }

    //Loot
    function drawSphere(x,y,i,size,r,g,b,a) {
        var c = Math.round( (x-32)*(x-32) + ((y-32)*2)*((y-32)*2) );
        if ( c < size * size ) {
            set(i,r,g,b,a);
        }
    }
    /*
    function drawBox(x,y,i,size,r,g,b,a) {
        var c = Math.round( Math.abs(y-32)*2+Math.abs(x-32) );
        if ( c < size ) {
            set(i,r,g,b,a);
        }
    }
    boxes = [
        [ 255,102,25, 16, 20, drawBox ],
        [ 255,102,25, 16, 20, drawSphere ],
        [ 25,102,255, 16, 18, drawBox ],
        [ 25,102,255, 16, 18, drawSphere ],
        [ 25,255,102, 12, 16, drawBox ],
        [ 25,255,102, 12, 16, drawSphere ],
        [ 102,255,25, 12, 12, drawBox ],
        [ 102,255,25, 12, 12, drawSphere ],
    ];
    for ( var boxI = 0; boxI < boxes.length; boxI++ ) {
        var box = boxes[boxI];
        runImage( function( x, y, i ) {
            box[5]( x+7, y-3.5, i, box[4]+4, 50,50,50,80 );
            for (var _y=0; _y<box[3]; _y++ ) {
                var col = Math.min( 1.0, 0.6 + _y * 0.05 );
                if ( _y > 7 && _y%2==0 ) col = 0.6;
                box[5]( x,y+_y, i, box[4], box[0]*col,box[1]*col,box[2]*col,255 );
            }
            box[5]( x,y+box[3], i, box[4]*0.7, box[0]*0.7,box[1]*0.7,box[2]*0.7,255 );
            addNoise( i, 15 );
        } );
        put( 5*8 + boxI );
    }
    */

    var coins = [];
    for ( var coinSetI = -1; coinSetI < 8; coinSetI++ ) {
        var baseY = ( ( coinSetI + 2 ) / 10 ) * 44 - 22;
        var baseX = Math.sin( 2 * baseY ) * 15;
        coins[coins.length] = [ baseX, baseY ];

        if ( coinSetI < 0 ) continue;

        for ( coinI = 0; coinI < coins.length; coinI++ ) {
            var coin = coins[coinI];
            var yOffset = 18 - ( 35 / 8 / 2 * coinSetI );

            runImage( function( x, y, i ) {
                //drawSphere( x+7-coin[0], y-3.5-coin[1], i, 8, 0,0,0,80 );
                for (var _y=0; _y<3; _y++ ) {
                    var col = Math.min( 1.0, 0.85 + _y * 0.05 );
                    drawSphere( x - coin[0], y + _y - coin[1] - yOffset, i, 6, 220*col, 150*col, 25*col );
                }
                addNoise( i, 15 );
            } );
        }
        put( 5*8 + coinSetI );
    }
}
