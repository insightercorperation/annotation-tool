#!/bin/bash

number=''

for i in {1..30}
do
    
    if [ $i -lt 10 ]; then
        number="0$i"
    elif [ $i -eq 30 ]; then
        number="98"
    else
        number=${i}
    fi
    
    outputdir="$(pwd)/output/$number"
    if ! [ -d "$outputdir" ]; then
        cm="mkdir -p $outputdir"
        $cm
    fi


    cmd="yarn dev src/createMetaProject.ts --kipris $(pwd)/input/main_$number.csv --vienna $(pwd)/input/vienna_code.txt --outputDir $(pwd)/output/$number --main $number"

    $cmd
done
