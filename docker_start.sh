#!/bin/bash

if [ -d "./data" ]
then
  echo "Linking in config and role files from ./data"
  ln -s ./data/config.json config.json
  ln -s ./data/roles.db roles.db
fi

echo "Running application"
./bin/gandalf_discord_bot start
