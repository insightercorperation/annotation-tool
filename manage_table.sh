
export $(cat .env.dev | xargs)

cd server

node src/queries/schema.js \
--host=db \
--port=3306 \
--database=$MYSQL_DATABASE \
--user=$MYSQL_USER \
--password=$MYSQL_PASSWORD \
--action $1