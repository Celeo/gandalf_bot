set dotenv-load := false

default: run

network := "discord.com,gateway.discord.gg,minecraft-api.com,api.ggod.io,vh-testing-bucket.fra1.digitaloceanspaces.com"
read_files := "config.json,roles.db,roles.db-journal,words.txt,src/configWorker.ts,src/birthdaysWorker.ts,src/minecraftWorker.ts,valheim_backups"
write_files := "roles.db,roles.db-journal,config.json,config.json.bak,valheim_backups"
packaged_output := "/tmp/gandalf_bot.dist.tar.gz"

setup:
    -rm data.db
    @echo "import { databaseSetup } from './src/db.ts'; databaseSetup(); 'Done'" | deno

run:
    @deno run \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net={{network}} \
        main.ts

compile:
    @deno compile \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net={{network}} \
        main.ts

test:
    @deno test --allow-all

test-cov:
    @deno test --allow-all --coverage=coverage
    @deno coverage coverage

download_words:
    @wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O words.txt

deploy:
    @tar -cpzf {{packaged_output}} main.ts src words.txt
    @scp {{packaged_output}} "$SSH_HOST_NAME:/srv/"
    @rm -f {{packaged_output}}
