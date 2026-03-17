#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <container_name_or_id>"
  exit 1
fi

container="$1"

pid=$(sudo docker inspect --format '{{.State.Pid}}' "$container")

if [ -z "$pid" ] || [ "$pid" -eq 0 ]; then
  echo "Could not find a valid PID for container: $container"
  exit 1
fi

sudo kill -9 "$pid"

echo "Container '$container' (PID $pid) killed."
