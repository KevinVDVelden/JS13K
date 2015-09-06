#!/bin/sh
echo 'cat - \' > subst_const.sh
cat *.js | \
    grep @const | \
    sed 's/.* \([A-Z_]\+\) \+= \+\([0-9.]\+\).*;/ | sed s#\1#\2#g \\/' | \
    grep -v '@const' | \
    awk '{print length,$0}' | \
    sort -r -n -s | \
    cut -d" " -f2- | \
    tee -a subst_const.sh
echo '' >> subst_const.sh
