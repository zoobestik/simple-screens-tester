#!/usr/bin/env bash

NAME="zoobestik/simple-screens-tester"
VERSION=2

echo "Build docker image v$VERSION..."
docker build --rm --compress --no-cache --pull -t "$NAME:$VERSION" .
docker tag "$NAME:$VERSION" "$NAME"

echo "Publishing $VERSION"

docker push "$NAME"
docker push "$NAME:$VERSION"

echo "Done!"

