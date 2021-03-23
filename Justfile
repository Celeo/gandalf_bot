SSH_TARGET := "do"
IMAGE_NAME := "gandalf_bot.image"

default:

build:
  podman build . -t celeo/gandalf_bot

image-save:
  podman image save --compress --output {{IMAGE_NAME}} celeo/gandalf_bot

deploy: build image-save
  scp {{IMAGE_NAME}} {{SSH_TARGET}}:/srv/
