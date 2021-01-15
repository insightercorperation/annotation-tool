rootDir=$1
url=$2

for file in $1/image_collection_*.json; do
    echo $file
    yarn dev src/uploadImage.ts --image $file --url $2
done