#!/bin/sh

if  docker ps | grep 'linvis-docker-app' >/dev/null ; then
  docker stop linvis-docker-app
fi

if  docker ps -a | grep 'linvis-docker-app' >/dev/null ; then
  docker rm linvis-docker-app
fi

docker build -t linvis_image package
