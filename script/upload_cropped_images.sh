rootDir=$1
url=$2

for file in $1/*.json; do
  echo $file
  yarn dev src/uploadCroppedImages.ts --croppedImage $file --url $2
done