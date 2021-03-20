FROM docker.io/bitwalker/alpine-elixir:latest AS release_stage

ARG DISCORD_TOKEN
ENV MIX_ENV=prod
ENV DISCORD_TOKEN=${DISCORD_TOKEN}

COPY mix.exs mix.lock ./
RUN mix deps.get
RUN mix deps.compile

COPY config ./config
COPY lib ./lib
RUN mix release

FROM docker.io/bitwalker/alpine-elixir:latest AS run_stage
COPY --from=release_stage $HOME/_build/prod/rel/gandalf_discord_bot .
CMD ["./bin/gandalf_discord_bot", "start"]
