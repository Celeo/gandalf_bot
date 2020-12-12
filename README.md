# gandalf_bot

[![CI](https://github.com/Celeo/gandalf_bot/workflows/CI/badge.svg?branch=master)](https://github.com/Celeo/gandalf_bot/actions?query=workflow%3ACI)
[![Python version](https://img.shields.io/badge/Python-3.7+-blue)](https://www.python.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A Discord bot.

## Installing

1. Install [poetry](https://python-poetry.org/)
1. Clone the repo
1. Install dependencies with `poetry install`

## Using

1. Copy the `config.example.json` file to `config.json`
1. Populate with at least your bot's token and the containment role id. The other fields are optional.
1. Run with `poetry run python gandalf_bot/__init__.py`

If you want to enable the functionality to post screenshots of merits, you'll need to create your own screenshots. Sorry, but copyright.

## Developing

### Building

### Requirements

* Git
* Poetry
* Python 3.9

### Steps

```sh
git clone https://github.com/Celeo/bless_you_bot
cd bless_you_bot
poetry install
```

### Running tests

| | |
| --- | --- |
| No coverage | `poetry run pytest`
| Coverage printout | `poetry run pytest --cov=gandalf_bot` |
| Coverage report | `poetry run pytest --cov=gandalf_bot --cov-report=html` |

## License

Licensed under MIT ([LICENSE](LICENSE)).

## Contributing

Note: preceding my normal "contributions welcome" message is a disclaimer that this bot is specifically made for a Discord guild I'm in. If you want to contribute a bit, you're welcome to, but the intent of this bot won't really grow.

Please feel free to contribute. Please open an issue first (or comment on an existing one) so that I know that you want to add/change something.

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license,
shall be dual licensed as above, without any additional terms or conditions.
