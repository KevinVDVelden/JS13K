#!/bin/bash
rm "$2"/*

for compression in `seq 0 9`
do
    zip -r -$compression "$2"/temp_$compression.zip "$1" 1>/dev/null
done

SMALLEST="`ls -Sr $2 | head -1`"
echo Smallest is $SMALLEST
cp $2/$SMALLEST "$3"
