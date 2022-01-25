set dotenv-load := false

default: run

read_files := ".env,.env.defaults,config.json,roles.db,roles.db-journal,words.txt"
write_files := "roles.db,roles.db-journal"
packaged_output := "/tmp/gandalf_bot.dist.tar.gz"

setup:
    -rm data.db
    @echo "import { databaseSetup } from './src/db.ts'; databaseSetup(); 'Done'" | deno

run:
    @deno run \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net=discord.com,gateway.discord.gg \
        main.ts

compile:
    @deno compile \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net=discord.com,gateway.discord.gg \
        main.ts

bundle:
    @deno bundle main.ts bundle.js

test:
    @deno test --allow-all

download_words:
    @wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O words.txt

deploy:
    @tar -cpzf {{packaged_output}} main.ts src words.txt
    @scp {{packaged_output}} "$SSH_HOST_NAME:/srv/"
    @rm -f {{packaged_output}}