set dotenv-load := false

default: run

output_name := "gandalf_bot"
read_files := "config.json,roles.db,roles.db-journal,words.txt"
write_files := "roles.db,roles.db-journal,config.json,config.json.bak"

run:
    @deno run \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net \
        main.ts

test:
    @deno test --allow-all

test-cov:
    @deno test --allow-all --coverage=coverage
    @deno coverage coverage

download_words:
    @wget https://raw.githubusercontent.com/dwyl/english-words/master/words.txt -O words.txt

compile:
    @rm -f {{output_name}}
    @deno compile \
        --allow-read={{read_files}} \
        --allow-write={{write_files}} \
        --allow-net \
        --output {{output_name}} \
        main.ts

deploy:
    @scp {{output_name}} "$SSH_HOST_NAME:/srv/{{output_name}}.new"

docker-build:
    @docker build -t {{output_name}} .

docker-run:
    @docker run --rm -v ./config.json:/opt/config.json {{output_name}}
