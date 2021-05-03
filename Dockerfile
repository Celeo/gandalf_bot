FROM docker.io/hexpm/elixir:1.11.4-erlang-23.3.2-ubuntu-xenial-20210114 AS build

ARG DISCORD_TOKEN
ENV MIX_ENV=prod
ENV DISCORD_TOKEN=${DISCORD_TOKEN}

RUN apt-get update && apt-get install -y cmake

COPY mix.exs mix.lock ./
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get && mix deps.compile

COPY config lib ./
RUN mix release

FROM docker.io/hexpm/elixir:1.11.4-erlang-23.3.2-ubuntu-xenial-20210114 AS run
COPY --from=build $HOME/_build/prod/rel/gandalf_discord_bot .
CMD ["./bin/gandalf_discord_bot", "start"]
