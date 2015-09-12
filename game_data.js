/** @const */ STAT_FROZEN = 0;
/** @const */ STAT_FEAR = 1;
/** @const */ STAT_BORED = 2;
/** @const */ STAT_LOOT_VALUE = 3;
/** @const */ STAT_ACTION_TIME = 4;

/** @const */ TAG_ENT_TYPE = 0;
/** @const */ TAG_ICON = 1;
/** @const */ TAG_TILE = 2;
/** @const */ TAG_THOUGHT = 3;
/** @const */ TAG_TILE_ICON = 4;
/** @const */ TAG_TRIGGER_ACTION = 5;
/** @const */ TAG_ISO_IMAGE = 6;
/** @const */ TAG_META = 7;
/** @const */ TAG_ICON_ALPHA = 8;

/** @const */ TAG_TRIGGER = 1000;
/** @const */ TAG_TILE_BASE = 1001;
/** @const */ TAG_THOUGHT_ALPHA = 1002;
/** @const */ TAG_TILE_LAST_TYPE = 1003;
/** @const */ TAG_LAST_STATE = 1004;
/** @const */ TAG_LAST_TARGET = 1005;
/** @const */ TAG_LOOTED = 1006;

/** @const */ TYPE_THIEF = 1;
/** @const */ TYPE_LOOT = 2;
/** @const */ TYPE_TRAP = 3;
/** @const */ TYPE_ENTRANCE = 4;
/** @const */ TYPE_EXIT = 5;
/** @const */ TYPE_PLACER = 6;
/** @const */ TYPE_GUARD = 7;
/** @const */ TYPE_SIGIL = 8;
/** @const */ TYPE_CAUGHT_THIEF = 9;

/** @const */ ENTITY_X = 0;
/** @const */ ENTITY_Y = 1;
/** @const */ ENTITY_VEL_X = 0;
/** @const */ ENTITY_VEL_Y = 1;
/** @const */ ENTITY_ATTRIBUTE = 4;
/** @const */ ENTITY_MAX_ATTRIBUTE = 5;
/** @const */ ENTITY_CHANGE_ATTRIBUTE = 6;
/** @const */ ENTITY_TAGS = 7;
/** @const */ ENTITY_THINK = 8;
/** @const */ ENTITY_ID = 9;

/** @const */ ENTITY_BASE_ATTRIBUTE = 0;
/** @const */ ENTITY_BASE_TAGS = 1;
/** @const */ ENTITY_BASE_THINK = 2;
/** @const */ var TILE_ENTRANCE = 1*8+1;
/** @const */ var TILE_EXIT = 1*8+2;
/** @const */ var THIEF_BASE =   [ [[0,0,64,-1],[0,0,10,-0.01],[0,0,10,0.01],,[0,0,999,-1]], [TYPE_THIEF,3*8+0,,], [thiefThink] ];
/** @const */ var GUARD_BASE =   [ [,,,,[0,0,999,-1]], [TYPE_GUARD,3*8+4,,], [guardThink] ];
/** @const */ var ENTRANCE_BASE =[ [[0,0,999999,-1]], [TYPE_ENTRANCE,,TILE_ENTRANCE], [entranceThink] ];
/** @const */ var EXIT_BASE =    [ [[60,0,60,-1]], [TYPE_EXIT,,1*8+2,,,trapDisableExit], [] ];
/** @const */ var TRAP_BASES = { 
    'alarm': [ [[10,0,40,-1]], [TYPE_TRAP,,1*8+5,,,trapTriggerNeighbours], [trapThink] ],
    'freeze': [ [[10,0,60,-1]], [TYPE_TRAP,,1*8+4,,,trapFreeze], [trapThink] ],
    'shock': [ [[10,0,70,-1]], [TYPE_TRAP,,1*8+6,,,trapZap], [trapThink] ],
    'sigil': [ [[60,0,60,-1]], [TYPE_SIGIL,2*8+0], [animate,removeUnfrozen] ],
    'sigil2': [ [[120,0,120,-1]], [TYPE_SIGIL,2*8+0], [animate,removeUnfrozen] ],
};
/** @const */ var LOOT = {
    0: [ [,,,[10,0,10,0.0001]],             [TYPE_LOOT], [lootUpdate] ],
    1: [ [,,,[20,0,40,0.0001]],             [TYPE_LOOT], [lootUpdate] ],
    2: [ [,,,[40,0,40,0.0001]],             [TYPE_LOOT], [lootUpdate] ],
};
/** @const */ var TRAP_NAMES = [ 'Alarm TDS&copy;', 'Freeze TDS&copy;', 'Zap TDS&copy;' ];

ThievesCaught = 0;
ThievesEscaped = 0;
ThievesCaughtLooted = 0;
ThievesEscapedLooted = 0;

function isType( type ) {
    return function( ent ) {
        return ent[ENTITY_TAGS][TAG_ENT_TYPE] == type;
    }
}

function removeUnfrozen( world, ent ) {
    var t = ent[ENTITY_ATTRIBUTE][STAT_FROZEN];
    if ( t == 0 ) {
        world.removeEntity( ent );
    } else {
        ent[ENTITY_TAGS][TAG_ICON_ALPHA] = clamp( 0,1, t/20 );
    }
}
function lootUpdate( world, ent ) {
    ent[ENTITY_TAGS][TAG_TILE_ICON] = 5*8 + clamp( 0, 7, ent[ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] / 5 )|0;
}
function animate( world, ent ) {
    if ( tickI % 4 != 0 ) return;
    var t = ent[ENTITY_TAGS][TAG_ICON];

    ent[ENTITY_TAGS][TAG_ICON] = t - ( t % 4 ) + ( ( t + 1 ) % 4 );
}

function trapThink( world, ent ) {
    if ( ! ent[ENTITY_TAGS][TAG_TRIGGER_ACTION] ) {
        console.log( 'Error triggering ' + ent + ', no action' );
    }
    var frozen = ent[ENTITY_ATTRIBUTE][STAT_FROZEN];
    ent[ENTITY_TAGS][TAG_TILE] = frozen > 10 ? (1*8+7) : ( frozen > 5 ? (1*8+8) : ent[ENTITY_TAGS][TAG_TILE_BASE] );
    if ( frozen > 0 ) {
        return;
    }

    if ( ent[ENTITY_TAGS][TAG_TRIGGER] ) {
        if ( ent[ENTITY_TAGS][TAG_TRIGGER][1] && ent[ENTITY_TAGS][TAG_TRIGGER][0] == tickI ) {
            ent[ENTITY_TAGS][TAG_TRIGGER_ACTION]( world, ent, ent[ENTITY_TAGS][TAG_TRIGGER][1] );
            ent[ENTITY_TAGS][TAG_TRIGGER] = null;
        }
    }

    var entities = world.entsAtPos( ent[0], ent[1] ).filter( isType( TYPE_THIEF ) );

    for ( var i = 0; i < entities.length; i++ ) {
        if ( Math.abs( entities[i][0]-ent[0] ) + Math.abs( entities[i][1]-ent[1] ) < 1 ) {
            ent[ENTITY_TAGS][TAG_TRIGGER_ACTION]( world, ent, entities[i] );
        }
    }
}

function trapDisableExit( ent ) {
    ent[ENTITY_ATTRIBUTE][STAT_FROZEN] = ent[ENTITY_MAX_ATTRIBUTE][STAT_FROZEN][1];
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

    world.addEntity( ent[ENTITY_X], ent[ENTITY_Y], TRAP_BASES['sigil2'] );

    trigger( ent[0]-1, ent[1]-0 );
    trigger( ent[0]+1, ent[1]-0 );
    trigger( ent[0]-0, ent[1]-1 );
    trigger( ent[0]-0, ent[1]+1 );
}

function moveTo( world, ent, target ) {
    target = world.pathTo( target[0], target[1] ).directionFrom( ent[ENTITY_X], ent[ENTITY_Y] );
    if ( !target ) return false;

    ent[ENTITY_X] += target[0];
    ent[ENTITY_Y] += target[1];
    ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] = 2.5 + Math.random() * 5;
    return true;
}


thiefSpawnCount = 0;
function entranceThink( world, ent ) {
    if ( ent[ENTITY_ATTRIBUTE][STAT_FROZEN] == 1 ) {
        var newEnt = world.addEntity( ent[0], ent[1], THIEF_BASE );
        newEnt[ENTITY_TAGS][TAG_ICON] += Math.floor( Math.random() * 4 );

        var waveCount = 1;
        var count = thiefSpawnCount;
        while ( count > ( waveCount * 10 ) ) {
            count -= waveCount * 10;
            waveCount += 1;
        }

        if ( count / waveCount == ( ( count / waveCount ) | 0 ) ) {
            ent[ENTITY_ATTRIBUTE][STAT_FROZEN] = ( 30 * 20 ) - ( 2 * 20 * ( count / waveCount ) );
        } else {
            ent[ENTITY_ATTRIBUTE][STAT_FROZEN] = 5 * 20;
        }

        console.log( count, waveCount, thiefSpawnCount );
        thiefSpawnCount += 1;
    } else {
        var remaining = ent[ENTITY_ATTRIBUTE][STAT_FROZEN] / 20;
        document.getElementById('nT').innerHTML = fillThieves(data['top.html']).replace('$SPAWN', Math.ceil( remaining ) );
    }
}
function guardThink( world, ent ) {
    if ( !world.thiefMap ) return;

    var dir = world.thiefMap.directionFrom( ent[ENTITY_X], ent[ENTITY_Y] );
    if ( ! dir ) dir = world.sigilMap.directionFrom( ent[ENTITY_X], ent[ENTITY_Y] );

    var ents = world.entsAtPos( ent[ENTITY_X], ent[ENTITY_Y] ).filter( isType( TYPE_THIEF ) );
    for ( var i = 0; i < ents.length; i++ ) {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+5;

        ents[i][ENTITY_TAGS][TAG_ENT_TYPE] = TYPE_CAUGHT_THIEF;
        ents[i][ENTITY_ATTRIBUTE][STAT_FROZEN] = ents[i][ENTITY_MAX_ATTRIBUTE][STAT_FROZEN][1];
        ents[i][ENTITY_THINK] = [ removeUnfrozen ];

        ThievesCaught += 1;
        for ( var target in ents[i][ENTITY_TAGS][TAG_LOOTED] ) {
            ThievesCaughtLooted += ents[i][ENTITY_TAGS][TAG_LOOTED][target];
            var pos = target.split(',');
            world.entsAtPos(pos[0]|0,pos[1]|0).filter(isType(TYPE_LOOT))[0][ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] += ents[i][ENTITY_TAGS][TAG_LOOTED][target];
        }
    }

    if ( dir ) {
        if ( ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] == 0 ) {
            ent[ENTITY_X] += dir[0];
            ent[ENTITY_Y] += dir[1];
            ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] = 6.5 + Math.random() * 4;
        }

        if ( ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] > 0 ) {
            ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] -= 0.1;
        } else {
            ent[ENTITY_TAGS][TAG_THOUGHT] = 0;
        }
    } else if ( ent[ENTITY_X] != ent[ENTITY_TAGS][TAG_META][0] || ent[ENTITY_Y] != ent[ENTITY_TAGS][TAG_META][1] ) {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+3;
        ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = clamp( 0, 1, Math.sin( tickI / 8 + ent[ENTITY_ID] ) );

        if ( ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] == 0 ) {
            moveTo( world, ent, ent[ENTITY_TAGS][TAG_META] );
        }
    } else {
        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+3;
        ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = clamp( 0, 1, Math.sin( tickI / 16 + ent[ENTITY_ID] ) );
    }
}
function thiefThink( world, ent ) {
    /** @const */ var STATE_RETREATING = 0;
    /** @const */ var STATE_LOOTING = 1;
    /** @const */ var STATE_EMERGENCY_EXIT = 2;
    var state = 0;
    if ( ent[ENTITY_TAGS][TAG_META] == STATE_EMERGENCY_EXIT ) {
        state = STATE_EMERGENCY_EXIT;
    } else {
        if ( ent[ENTITY_ATTRIBUTE][STAT_FROZEN] > 0 ) {
            ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+2;
            ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = 1;
            return;
        } else if ( ent[ENTITY_ATTRIBUTE][STAT_FEAR] > 8 && ent[ENTITY_ATTRIBUTE][STAT_FEAR] > ent[ENTITY_ATTRIBUTE][STAT_BORED] ) {
            ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+6
            ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = Math.min( 1, Math.max( 0, Math.abs( Math.sin( tickI / 40 ) ) + ent[ENTITY_ATTRIBUTE][STAT_FEAR]/10 ) );
            state = STATE_RETREATING;
        } else if ( ent[ENTITY_ATTRIBUTE][STAT_BORED] > 8 ) {
            ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+4
            ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = Math.min( 1, Math.max( 0, Math.abs( Math.sin( tickI / 40 ) ) + ent[ENTITY_ATTRIBUTE][STAT_BORED]/10 ) );
            state = STATE_RETREATING;
        } else {
            if ( ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] > 0 ) {
                ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] -= 0.2;
            } else {
                ent[ENTITY_TAGS][TAG_THOUGHT] = 0;
            }
            state = STATE_LOOTING;
        }
    }

    var targets = [];
    var target;
    var ents;

    if ( ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] == 0 ) {
        if ( state == STATE_LOOTING ) {
            if ( !ent[ENTITY_TAGS][TAG_LAST_TARGET] ) {
                ents = world.entsOfType(TYPE_LOOT);
                for ( var i in ents ) {
                    var lookEnt = ents[i];
                    target = [ lookEnt[ENTITY_X], lookEnt[ENTITY_Y] ]


                    if ( ents[i][ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] < 1 ) continue;
                    if ( ent[ENTITY_TAGS][TAG_LOOTED] && ent[ENTITY_TAGS][TAG_LOOTED][target] ) continue;

                    targets[targets.length] = target;
                }

                if ( targets.length == 0 ) {
                    ent[ENTITY_ATTRIBUTE][STAT_BORED] = ent[ENTITY_MAX_ATTRIBUTE][STAT_BORED][1];
                    return;
                }

                target = targets[ ( Math.random() * targets.length ) | 0 ];
                ent[ENTITY_TAGS][TAG_LAST_TARGET] = target;
            }

            target = ent[ENTITY_TAGS][TAG_LAST_TARGET];

            if ( ent[ENTITY_X] == target[0] && ent[ENTITY_Y] == target[1] ) {
                if ( ! ent[ENTITY_TAGS][TAG_LOOTED] ) ent[ENTITY_TAGS][TAG_LOOTED] = [];

                ent[ENTITY_TAGS][TAG_LAST_TARGET] = null;
                ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] = 20;
                console.log( 'Loot!', target );

                ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+5;
                ent[ENTITY_TAGS][TAG_THOUGHT_ALPHA] = 2;

                ents = world.entsAtPos( target[0], target[1] ).filter( isType( TYPE_LOOT ) );
                for ( var i in ents ) {
                    ent[ENTITY_TAGS][TAG_LOOTED][''+target] = clamp( 0, 20, ents[i][ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] );
                    ents[i][ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] = clamp( 0, 20, ents[i][ENTITY_ATTRIBUTE][STAT_LOOT_VALUE] - 20 );
                }
            } else {
                moveTo( world, ent, target );
            }
        } else {
            if ( !ent[ENTITY_TAGS][TAG_LAST_TARGET] || ent[ENTITY_TAGS][TAG_META] == STATE_LOOTING ) {
                ents = world.entsOfType(TYPE_EXIT);
                for ( var i in ents ) {
                    var lookEnt = ents[i];
                    target = [ lookEnt[ENTITY_X], lookEnt[ENTITY_Y] ]
                    targets[targets.length] = target;
                }

                target = targets[ ( Math.random() * targets.length ) | 0 ];
                ent[ENTITY_TAGS][TAG_LAST_TARGET] = target;
            }

            target = ent[ENTITY_TAGS][TAG_LAST_TARGET];
            if ( ent[ENTITY_X] == target[0] && ent[ENTITY_Y] == target[1] ) {
                ent[ENTITY_TAGS][TAG_ENT_TYPE] = TYPE_CAUGHT_THIEF;
                ent[ENTITY_ATTRIBUTE][STAT_FROZEN] = ent[ENTITY_MAX_ATTRIBUTE][STAT_FROZEN][1];
                ent[ENTITY_THINK] = [ removeUnfrozen ];
                ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+5;

                ThievesEscaped += 1;
                for ( var target in ent[ENTITY_TAGS][TAG_LOOTED] ) {
                    ThievesEscapedLooted += ent[ENTITY_TAGS][TAG_LOOTED][target];
                }
            } else {
                if ( !moveTo( world, ent, target ) ) {
                    if ( ent[ENTITY_TAGS][TAG_META] == STATE_EMERGENCY_EXIT ) {
                        world.removeEntity( ent );
                    } else {
                        ent[ENTITY_TAGS][TAG_THOUGHT] = 4*8+1;
                        state = STATE_EMERGENCY_EXIT;
                        ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] = 30;
                    }
                }
                //Add some extra time for teleporting
                if ( ent[ENTITY_X] == target[0] && ent[ENTITY_Y] == target[1] ) {
                    ent[ENTITY_ATTRIBUTE][STAT_ACTION_TIME] = 10;
                }
            }
        }
        ent[ENTITY_TAGS][TAG_META] = state;
    }
}
