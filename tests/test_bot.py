from loguru import logger
import pytest

from gandalf_bot import bot
from gandalf_bot.bot import (
    on_ready,
    on_command_error,
    _admin_command_check,
    _get_containment_role,
    main,
)
from gandalf_bot.config import BasicConfig


@pytest.mark.asyncio
async def test_on_ready(mocker):
    spy = mocker.spy(logger, "info")
    await on_ready()
    spy.assert_called_once_with("Bot::on_ready")


@pytest.mark.asyncio
async def test_on_command_error():
    await on_command_error(None, None)


def test_admin_command_check(mocker):
    context = mocker.MagicMock()
    context.author.guild_permissions.administrator = True
    ret = _admin_command_check(context)
    assert ret
    context.author.guild_permissions.administrator = False
    ret = _admin_command_check(context)
    assert not ret


@pytest.mark.asyncio
async def test_get_containment_role(mocker):
    role = mocker.MagicMock()
    context = mocker.MagicMock()
    context.guild.get_role.return_value = role
    config = mocker.MagicMock()
    config.containment_role_id = 1
    ret = await _get_containment_role(context, config)
    context.guild.get_role.assert_called_with(1)
    context.send.assert_not_called()
    assert ret == role


@pytest.mark.asyncio
async def test_get_containment_role_invalid(mocker):
    mocks = []

    async def send(*args, **kwargs):
        mocks.append("send")

    role = mocker.MagicMock()
    role.__bool__.return_value = False
    context = mocker.MagicMock()
    context.guild.get_role.return_value = role
    context.send = send
    config = mocker.MagicMock()
    config.containment_role_id = 1
    ret = await _get_containment_role(context, config)
    assert not ret
    context.guild.get_role.assert_called_with(1)
    assert "send" in mocks


def test_main(monkeypatch, mocker):
    bot_mock = mocker.MagicMock()
    monkeypatch.setattr(bot, "bot", bot_mock)
    monkeypatch.setattr(
        BasicConfig, "from_disk", lambda: BasicConfig("abc", 0, None, [])
    )
    main()
    bot_mock.run.assert_called_once_with("abc")
