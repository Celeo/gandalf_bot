defmodule Bot.Commands do
  require Logger

  def run!(msg) do
    [name, args] = String.split(msg.content, " ", parts: 2, trim: true)
    args = String.split(args, " ", trim: true)

    case name do
      "!breach" -> cmd_breach!(args)
      "!unbreach" -> cmd_unbreach!(args)
      "!sitrep" -> cmd_sitrep!(args)
      "!roll" -> cmd_roll!(args)
    end
  end

  defp cmd_breach!(_args) do
    Logger.debug("cmd_breach!()")
    # TODO
  end

  defp cmd_unbreach!(_args) do
    Logger.debug("cmd_unbreach!()")
    # TODO
  end

  defp cmd_sitrep!(_args) do
    Logger.debug("cmd_sitrep!()")
    # TODO
  end

  defp cmd_roll!(_args) do
    Logger.debug("cmd_roll!()")
    # TODO
  end
end
