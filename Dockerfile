FROM docker.io/hexpm/elixir:1.11.4-erlang-23.3.2-ubuntu-xenial-20210114 AS build

ARG DISCORD_TOKEN
WORKDIR /opt/app
ENV MIX_ENV=prod
ENV DISCORD_TOKEN=${DISCORD_TOKEN}

RUN apt-get update && apt-get install -y cmake

COPY mix.exs mix.lock ./
RUN mix local.hex --force   &&\
    mix local.rebar --force &&\
    mix deps.get            &&\
    mix deps.compile

COPY priv ./priv
COPY config ./config
COPY lib ./lib
RUN mix release

FROM docker.io/hexpm/elixir:1.11.4-erlang-23.3.2-ubuntu-xenial-20210114 AS run
RUN mkdir /opt/app
WORKDIR /opt/app
COPY --from=build /opt/app/_build/prod/rel/gandalf_discord_bot .
COPY docker_start.sh .
CMD ["bash", "docker_start.sh"]
