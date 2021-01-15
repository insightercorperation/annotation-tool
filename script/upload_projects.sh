rootDir=$1
url=$2

for file in $1/project_collection_*.json; do
    echo $file
    yarn dev src/uploadProject.ts --project $file --url $2
done