#!/bin/sh

if  docker ps | grep 'linvis-docker-app' >/dev/null ; then
  docker stop linvis-docker-app
fi

if  docker ps -a | grep 'linvis-docker-app' >/dev/null ; then
  docker rm linvis-docker-app
fi

docker build -t linvis_image_debug -f package/Dockerfile_Debug package
docker run --rm -it -p 8080:5000 --net=linvis-network -v "$(pwd)/package":/app --name linvis-debug-app linvis_image_debug
