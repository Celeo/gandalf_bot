set dotenv-load := false

default: run

files := ".env,.env.defaults,config.json,roles.db,roles.db-journal"

run:
    deno run \
        --allow-read={{files}} \
        --allow-write={{files}} \
        --allow-net=discord.com,gateway.discord.gg main.ts

compile:
    deno compile \
        --allow-read={{files}} \
        --allow-write={{files}} \
        --allow-net=discord.com,gateway.discord.gg main.ts

test:
    deno test --allow-all

download_words:
  wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O words.txt
