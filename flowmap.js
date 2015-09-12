/**@const */ var MAP_SIZE = 128;

var Flowmap_Dirs = [-1,1,MAP_SIZE,-MAP_SIZE];
var Flowmap_Dirs_Off = [ [-1,0], [1,0], [0,1], [0,-1] ];
function XY( i ) {
    return [ i % MAP_SIZE, ( i / MAP_SIZE ) | 0 ];
}
Flowmap = function( weights, isValid ) {
    this.weights = weights;
    this.isValid = isValid;

    this.lookQueue = [];
    this.lookSet = {};
    this.visited = [];
    for ( var i = 0; i < MAP_SIZE*MAP_SIZE; i++ ) this.visited[i] = 0;

    this.map = [];
    this.map[MAP_SIZE*MAP_SIZE+1]=0;
}
Flowmap.prototype.addTarget = function( x, y, val ) {
    if ( ! val ) val = 99999;
    var i = x+y*MAP_SIZE;
    this.lookQueue[this.lookQueue.length] = [ i, x, y, val, 0 ];
    this.lookSet[i] = true;
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

    return Flowmap_Dirs_Off[closeI];
}
    
Flowmap.prototype.directionFrom = function Flowmap_directionFrom( tX, tY ) {
    var map = this.map;

    var lookQueue = this.lookQueue;
    var lookSet = this.lookSet;
    I = this.I;
    var targetX = this.targetX; var targetY = this.targetY;
    var weights = this.weights;
    isValid = this.isValid;

    var lookI = I(tX,tY);
    if ( map[lookI] ) {
        return this.bestNeighbour( lookI );
    }
    function add( x, y, w ) {
        if ( x < 0 || y < 0 || x > MAP_SIZE || y > MAP_SIZE ) return;

        var i = I( x, y );
        if ( !isValid( weights[ i ] ) || map[i] >= w ) return;
        if ( lookSet[i] && lookSet[i] >= w ) {
            return;
        }
        map[ i ] = w;

        lookQueue[lookQueue.length] = [ i, x, y, w, Math.abs( tX - x ) + Math.abs( tY - y ) ];
        lookSet[ i ] = w;
    }

    var checked = 0;
    while ( lookQueue.length > 0 && checked < 100000 ) {
        checked += 1;

        var first = lookQueue.pop();
        lookSet[ first[ 0 ] ] = false;

        this.visited[ first[0] ] += 1;

        //Get heighest neighbour
        var newWeight = 1;
        for ( var dirI = 0; dirI < 4; dirI++ ) {
            var testI = first[0]+Flowmap_Dirs[dirI];

            if ( map[ testI ] && map[ testI ] > newWeight ) {
                newWeight = map[ testI ];
            }
        }
        //One removed from neighbour so decrement
        newWeight -= 1;

        //No set neighbours, using the value from the insert
        if ( newWeight == 0 ) {
            map[ first[ 0 ] ] = first[ 3 ];
            newWeight = first[ 3 ];
        } else {
            //Get current value
            var curWeight = map[ first[ 0 ] ];

            //If the current value is higher or equal (i.e. closer) than the new value, skip
            if ( curWeight > newWeight ) {
                continue;
            }
            map[ first[0] ] = newWeight;
        }

        newWeight -= 1;

        for ( var dirI = 0; dirI < 4; dirI++ ) {
            var testI = first[0]+Flowmap_Dirs[dirI];

            if ( ( !map[ testI ] ) || map[ testI ] < newWeight ) {
                var _x = testI % MAP_SIZE;
                var _y = ( testI / MAP_SIZE ) | 0;
                add( _x, _y, newWeight - 1 );
            }
        }
        lookQueue.sort( function(b,a) { return a[3]!=b[3] ? b[3]-a[3] : a[4]-b[4] } );

        if ( lookI == first[0] ) break;
    }

    return this.bestNeighbour( lookI );
}
Flowmap.prototype.I = function Flomap_I(x,y) { return x+y*MAP_SIZE; }
