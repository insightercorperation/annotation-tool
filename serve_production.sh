#!/usr/bin/env bash
echo "production..."

SCALE=$1

docker-compose -f docker-compose-prod.yml up -d --scale app=$SCALE --build --force-recreate