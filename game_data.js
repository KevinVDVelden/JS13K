/** @const */ STAT_FROZEN = 0;
/** @const */ STAT_FEAR = 1;
/** @const */ STAT_BORED = 2;
/** @const */ STAT_LOOT_VALUE = 3;

/** @const */ TAG_ENT_TYPE = 0;
/** @const */ TAG_ICON = 1;
/** @const */ TAG_TILE = 2;
/** @const */ TAG_THOUGHT = 3;
/** @const */ TAG_TILE_ICON = 4;
/** @const */ TAG_TRIGGER_ACTION = 5;

/** @const */ TAG_TRIGGER = 1000;
/** @const */ TAG_TILE_BASE = 1001;
/** @const */ TAG_THOUGHT_ALPHA = 1002;

/** @const */ TYPE_THIEF = 1;
/** @const */ TYPE_LOOT = 2;
/** @const */ TYPE_TRAP = 3;
/** @const */ TYPE_ENTRANCE = 4;

/** @const */ ENTITY_X = 0;
/** @const */ ENTITY_Y = 1;
/** @const */ ENTITY_VEL_X = 0;
/** @const */ ENTITY_VEL_Y = 1;
/** @const */ ENTITY_ATTRIBUTE = 4;
/** @const */ ENTITY_MAX_ATTRIBUTE = 5;
/** @const */ ENTITY_CHANGE_ATTRIBUTE = 6;
/** @const */ ENTITY_TAGS = 7;
/** @const */ ENTITY_THINK = 8;
/** @const */ var THIEF_BASE =   [ [[0,0,64,-1],[0,0,10,-0.01],[0,0,10,0.001]], [TYPE_THIEF,3*8+3,,], [thiefThink] ];
/** @const */ var ENTRANCE_BASE =[ [], [TYPE_ENTRANCE,,1*8+1], [] ];
/** @const */ var EXIT_BASE =    [ [[60,0,60,-1]], [TYPE_ENTRANCE,,1*8+2,,,trapDisableExit], [] ];
/** @const */ var TRAP_BASES = { 
    0: [ [[40,0,40,-1]], [TYPE_TRAP,,1*8+4,,,trapTriggerNeighbours], [trapThink] ],
    1: [ [[60,0,60,-1]], [TYPE_TRAP,,1*8+3,,,trapFreeze], [trapThink] ],
    2: [ [[70,0,70,-1]], [TYPE_TRAP,,1*8+5,,,trapZap], [trapThink] ],
};
/** @const */ var LOOT = {
    0: [ [,,,[10,0,10,0.01]],             [TYPE_LOOT,,,,5*8+0], [] ],
    1: [ [,,,[20,0,40,0.01]],             [TYPE_LOOT,,,,5*8+3], [] ],
    2: [ [,,,[40,0,40,0.01]],             [TYPE_LOOT,,,,5*8+7], [] ],
};
/** @const */ var TRAP_NAMES = [ 'Alarm TDS&copy;', 'Freeze TDS&copy;', 'Zap TDS&copy;' ];

function trapThink( world, ent ) {
    if ( ! ent[ENTITY_TAGS][TAG_TRIGGER_ACTION] ) {
        console.log( 'Error triggering ' + ent + ', no action' );
    }
    var frozen = ent[ENTITY_ATTRIBUTE][STAT_FROZEN];
    ent[ENTITY_TAGS][TAG_TILE] = frozen > 10 ? (1*8+2) : ( frozen > 5 ? (1*8+3) : ent[ENTITY_TAGS][TAG_TILE_BASE] );
    if ( frozen > 0 ) {
        return;
    }

    if ( ent[ENTITY_TAGS][TAG_TRIGGER] ) {
        if ( ent[ENTITY_TAGS][TAG_TRIGGER][0]%1000 == tickI ) {
            ent[ENTITY_TAGS][TAG_TRIGGER_ACTION]( world, ent, ent[ENTITY_TAGS][TAG_TRIGGER][1] );
            ent[ENTITY_TAGS][TAG_TRIGGER] = null;
        }
    }

    var entities = world.entsAtPos( ent[0], ent[1] );

    for ( var i = 0; i < entities.length; i++ ) {
        if ( !entities[i][ENTITY_TAGS][TAG_ENT_TYPE] == TYPE_THIEF ) continue;
        if ( Math.abs( entities[i][0]-ent[0] ) + Math.abs( entities[i][1]-ent[1] ) < 1 ) {
            ent[ENTITY_TAGS][TAG_TRIGGER_ACTION]( world, ent, entities[i] );
        }
    }
}

function trapDisableExit( ent ) {
}
function trapSleep( ent ) {
    ent[ENTITY_ATTRIBUTE][STAT_FROZEN] = ent[ENTITY_MAX_ATTRIBUTE][STAT_FROZEN][1];
}
function trapFreeze( world, ent, target ) {
    //console.log( 'Freeze!' + target );
    target[ENTITY_ATTRIBUTE][STAT_FROZEN] += 10;
    trapSleep( ent );
}
function trapZap( world, ent, target ) {
    //console.log( 'Zap!' + target );
    target[ENTITY_ATTRIBUTE][STAT_FEAR] += 2;
    trapSleep( ent );
}
function trapTriggerNeighbours( world, ent, target ) {
    trapSleep( ent );

    function trigger( x, y ) {
        var entities = world.entsAtPos( x, y );
        for ( var i in entities ) {
            if ( entities[i][ENTITY_TAGS][TAG_TRIGGER_ACTION] ) {
                entities[i][ENTITY_TAGS][TAG_TRIGGER] = [ tickI + 1, target ];
            }
        }
    }

    trigger( ent[0]-1, ent[1]-0 );
    trigger( ent[0]+1, ent[1]-0 );
    trigger( ent[0]-0, ent[1]-1 );
    trigger( ent[0]-0, ent[1]+1 );
}

function thiefThink( world, ent ) {
    if ( ent[ENTITY_ATTRIBUTE][STAT_FROZEN] > 0 ) {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+2;
        ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = 1;
    } else if ( ent[ENTITY_ATTRIBUTE][STAT_FEAR] > 8 && ent[ENTITY_ATTRIBUTE][STAT_FEAR] > ent[ENTITY_ATTRIBUTE][STAT_BORED] ) {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+6
        ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = Math.min( 1, Math.max( 0, Math.abs( Math.sin( tickI / 40 ) ) + ent[ENTITY_ATTRIBUTE][STAT_FEAR]/10 ) );
    } else if ( ent[ENTITY_ATTRIBUTE][STAT_BORED] > 8 ) {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+4
        ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = Math.min( 1, Math.max( 0, Math.abs( Math.sin( tickI / 40 ) ) + ent[ENTITY_ATTRIBUTE][STAT_BORED]/10 ) );
    } else {
        if ( ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] > 0 ) {
            ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] -= 0.1;
        } else {
            ent[ENTITY_TAGS][TAG_THOUGHT] = 0;
        }
    }
}
