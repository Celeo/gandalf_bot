FROM python:3.9
LABEL maintainer="github.com/celeo"

WORKDIR /usr/src/app
VOLUME ["/data"]
ENTRYPOINT ["poetry", "run", "python", "run.py"]

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
ENV PATH="$PATH:/root/.poetry/bin"
COPY ["pyproject.toml", "poetry.lock", "./"]
RUN poetry install
COPY . ./