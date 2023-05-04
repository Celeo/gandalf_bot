set dotenv-load := false

default: run

output_name := "gandalf_bot"

run:
    @deno run --allow-net main.ts

test:
    @deno test --allow-all

test-cov:
    @deno test --allow-all --coverage=coverage
    @deno coverage coverage

download_words:
    @wget https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt -O words_raw.txt
    @cat words_raw.txt | tr -d '\r' > words.txt
    @rm words_raw.txt

words_to_clipboard:
    @cat words.txt | tr '\n' ',' | sed 's/.$//' | clip.exe

load_files_to_redis:
    @deno run --allow-read=config.json,words.txt --allow-net writeDataToRedis.ts

compile:
    @rm -f {{output_name}}
    @deno compile --allow-net --output {{output_name}} main.ts
