SSH_TARGET := "do"
IMAGE_FILE := "gandalf_bot.image.bin"
set dotenv-load := true

default:

download_words:
  wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O priv/words.txt

build:
  #!/usr/bin/env bash
  set -euxo pipefail
  source .env.prod
  podman build . -t celeo/gandalf_bot --build-arg DISCORD_TOKEN=${DISCORD_TOKEN}

image-save:
  rm -f {{IMAGE_FILE}}
  podman image save --output {{IMAGE_FILE}} celeo/gandalf_bot

run-image:
  #!/usr/bin/env bash
  rm -rf tmp
  mkdir tmp
  cp config.json roles.db tmp
  podman run -ti --rm -v `pwd`/tmp:/opt/app/data celeo/gandalf_bot bash

deploy: build image-save
  rsync -avz --progress {{IMAGE_FILE}} {{SSH_TARGET}}:/srv/gandalf_bot.image
