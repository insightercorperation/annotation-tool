
rootDir=$1
size=$2
outputDir=$3

# ls $1
initalId=1

for file in $1/**/*.json; do
    yarn dev src/createCollection.ts  --metaproject $file --size $size --initialId $initalId --outputDir $3

    last=$(ls $3/* | grep project_collection | sort | tail -1)
    count=$(cat $last | grep -Eow "\"count\": ([0-9]*)" | cut -d':' -f2)
    initalId=$(($initalId + $count))
done
