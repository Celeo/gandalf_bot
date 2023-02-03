FROM denoland/deno:latest

WORKDIR /opt
COPY main.ts words.txt /opt/
COPY src /opt/src

CMD ["run", "--allow-all", "main.ts"]
