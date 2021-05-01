defmodule Bot.Commands do
  require Logger

  def run!(msg) do
    [name, args] =
      case String.contains?(msg.content, " ") do
        true -> String.split(msg.content, " ", parts: 2, trim: true)
        false -> [msg.content, []]
      end

    case name do
      "!breach" -> cmd_breach!(args)
      "!unbreach" -> cmd_unbreach!(args)
      "!sitrep" -> cmd_sitrep!(args)
      "!roll" -> cmd_roll!(args)
      "!merit" -> cmd_merit!(args)
      "!reactionrole" -> cmd_reactionrole!(args)
      "!reactionroles" -> cmd_reactionroles!(args)
      _ -> :notfound
    end
  end

  defp cmd_breach!(args) do
    Logger.debug("cmd_breach!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_unbreach!(args) do
    Logger.debug("cmd_unbreach!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_sitrep!(args) do
    Logger.debug("cmd_sitrep!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_roll!(args) do
    Logger.debug("cmd_roll!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_merit!(args) do
    Logger.debug("cmd_merit!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_reactionrole!(args) do
    Logger.debug("cmd_reactionrole!(), args: #{inspect(args)}")
    # TODO
  end

  defp cmd_reactionroles!(args) do
    Logger.debug("cmd_reactionroles!(), args: #{inspect(args)}")
    # TODO
  end
end
