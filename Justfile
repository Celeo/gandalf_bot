SSH_TARGET := "do"
IMAGE_FILE := "gandalf_bot.image.bin"

default:

download_words:
  wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O priv/words.txt

build:
  #!/usr/bin/env bash
  set -euxo pipefail
  source .env
  podman build . -t celeo/gandalf_bot --build-arg DISCORD_TOKEN=${DISCORD_TOKEN}

image-save:
  rm -f {{IMAGE_FILE}}
  podman image save --output {{IMAGE_FILE}} celeo/bobby_bot

deploy: build image-save
  scp {{IMAGE_FILE}} {{SSH_TARGET}}:/srv/gandalf_bot.image
