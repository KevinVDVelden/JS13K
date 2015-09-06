if [ $# == 1 ]
then
    mkdir -p "$1"
    rm -fv "$1"/*

    SMALLEST=999999
    for compression in `seq 0 9`
    do
        for method in Deflate Deflate64 BZip2 LZMA PPMd
        do
            for passes in 1 5 10 15
            do
                FILE="$1/js13k_"$compression"_"$method"_"$passes".zip"
                7z a "$FILE" js13k/* -mpass=$passes -mx=$compression -mm=$method 1>/dev/null
                SIZE=`cat $FILE|wc -c`
                
                if [ "$SIZE" -lt "$SMALLEST" ]
                then
                    SMALLEST=$SIZE
                    echo '#!/bin/bash' > bestCompress.sh
                    echo '7z a "$3" "$1/*" '-mpass=$passes -mx=$compression -mm=$method '>/dev/null' >> bestCompress.sh
                    echo New smallest at $SMALLEST bytes "( -mpass=$passes -mx=$compression -mm=$method )"
                fi
            done
        done
    done
fi
