SSH_TARGET := "do"

default:

download_words:
  wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O priv/words.txt

build:
  #!/usr/bin/env bash
  set -euxo pipefail
  source .env
  podman build . -t celeo/gandalf_bot --build-arg DISCORD_TOKEN=${DISCORD_TOKEN}

image-save:
  podman image save --compress --output image.bin celeo/gandalf_bot

deploy: build image-save
  scp image.bin {{SSH_TARGET}}:/srv/
