FROM rust:latest as builder

WORKDIR /usr/src/app
COPY . .
# Will build and cache the binary and dependent crates in release mode
RUN --mount=type=cache,target=/usr/local/cargo,from=rust:latest,source=/usr/local/cargo \
    --mount=type=cache,target=target \
    cargo build --release && mv ./target/release/gandalf_bot ./gandalf_bot

# Runtime image
FROM debian:bullseye-slim
RUN apt update && apt install ca-certificates curl -y && apt-get clean
# Run as "app" user
RUN useradd -ms /bin/bash app

USER app
WORKDIR /app

# get the words
RUN curl -s https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt | tr -d '\r' > words.txt

# Get compiled binaries from builder's cargo install directory
COPY --from=builder /usr/src/app/gandalf_bot /app/gandalf_bot

# Run the app
CMD ./gandalf_bot
