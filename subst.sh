#!/bin/sh
cat - | sed 's/Math.PI/3.14159265359/g' | sh subst_const.sh
