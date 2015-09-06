var Flowmap_Dirs = [-1,1,MAP_SIZE,-MAP_SIZE];
function XY( i ) {
    return [ i % MAP_SIZE, ( i / MAP_SIZE ) | 0 ];
}
Flowmap = function( weights, targetX, targetY ) {
    this.weights = weights;

    this.lookQueue = [];

    this.map = [];
    this.map[MAP_SIZE*MAP_SIZE+1]=0;
}
Flowmap.prototype.addTarget = function( x, y ) {
    var i = x+y*MAP_SIZE;
    this.lookQueue[this.lookQueue.length] = [ i, x, y, 99999, 0 ];
}
Flowmap.prototype.bestNeighbour = function Flowmap_bestNeighbour( i ) {
    var closeI = -1;
    var weightI = 0;

    for ( var _i = 0; _i < 4; _i++ ) {
        var w = this.map[i+Flowmap_Dirs[_i]];
        if ( w >= 10 && w > weightI ) {
            weightI = w;
            closeI = _i;
        }
    }

    return i + Flowmap_Dirs[closeI];
}
    
Flowmap.prototype.directionFrom = function Flowmap_directionFrom( tX, tY ) {
    var map = this.map;

    var lookQueue = this.lookQueue;
    I = this.I;
    var targetX = this.targetX; var targetY = this.targetY;
    var weights = this.weights;

    var lookI = I(tX,tY);
    if ( map[lookI] ) {
        return this.bestNeighbour( lookI );
    }
    function add( x, y, w ) {
        if ( x < 0 || y < 0 || x > MAP_SIZE || y > MAP_SIZE ) return;

        var i = I( x, y );
        if ( this.weights[i] == 0 ) return;

        lookQueue[lookQueue.length] = [ i, x, y, w, Math.abs( tX - x ) + Math.abs( tY - y ) ];
        lookQueue.sort( function(b,a) { return a[4]==b[4] ? b[3]-a[3] : a[4]-b[4] } );
    }

    while ( lookQueue.length > 0 ) {
        var first = lookQueue.pop();
        console.log( first[1], first[2], first[3], first[4], first[0]-lookI);

        var w = 1;
        for ( var dirI = 0; dirI < 4; dirI++ ) {
            var testI = first[0]+Flowmap_Dirs[dirI];

            if ( map[ testI ] && map[ testI ] > w ) {
                w = map[ testI ];
            }
        }
        w -= 1;

        if ( w == 0 ) {
             map[ first[ 0 ] ] = first[ 3 ];
        } else {
            var v = map[ first[ 0 ] ];
            if ( v >= w + 1 ) continue;
            map[ first[0] ] = w;
        }

        for ( var dirI = 0; dirI < 4; dirI++ ) {
            var testI = first[0]+Flowmap_Dirs[dirI];

            if ( !map[ testI ] || map[ testI ] < w ) {
                var _x = testI % MAP_SIZE;
                var _y = ( testI / MAP_SIZE ) | 0;
                add( _x, _y, first[3] - 1 );
            }
        }

        if ( lookI == first[0] ) break;
    }

    return this.bestNeighbour( lookI );
}
Flowmap.prototype.I = function Flomap_I(x,y) { return x+y*MAP_SIZE; }
