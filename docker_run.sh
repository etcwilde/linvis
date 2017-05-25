#!/bin/sh
if  docker ps | grep 'linvis-docker-app' >/dev/null ; then
  docker stop linvis-docker-app
fi

if  docker ps -a | grep 'linvis-docker-app' >/dev/null ; then
  docker rm linvis-docker-app
fi

docker run -d -p 127.0.0.1:8080:5000 --net=linvis-network --name linvis-docker-app linvis_image
