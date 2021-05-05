#!/bin/bash

if [ -d "./data" ]
then
  echo "Copying files from ./data"
  cp ./data/{config.json,roles.db} .
fi

echo "Running application"
./bin/gandalf_discord_bot start
