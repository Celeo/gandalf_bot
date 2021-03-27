defmodule Bot.Dice do
  use EnumType

  @regex_modifier ~r/^[+|-]$/
  @regex_numeric ~r/^\d+$/
  @regex_split_on ~r/[ |\-|\+]/

  defenum RollType do
    value(Explode_10, {"10again", 10})
    value(Explode_9, {"9again", 9})
    value(Explode_8, {"8again", 8})
    value(Chance, {"chance", 11})

    default(Explode_10)

    def from_input(str) do
      val =
        Enum.find(RollType.values(), RollType.Explode_10.value(), fn {search_for, _} ->
          String.contains?(str, search_for)
        end)

      RollType.from(val)
    end
  end

  defp identify_part(part) do
    cond do
      Regex.match?(@regex_modifier, part) -> {:modifier, part}
      Regex.match?(@regex_numeric, part) -> {:number, part}
      true -> {:invalid, part}
    end
  end

  defp count_reduce_fn({id, val}, acc) do
    case id do
      :modifier ->
        %{acc | mod: val}

      :number when acc.mod === "+" ->
        %{acc | total: acc.total + String.to_integer(val)}

      :number when acc.mod === "-" ->
        %{acc | total: acc.total - String.to_integer(val), mod: :add}
    end
  end

  defp roll_die(), do: Enum.random(1..10)

  # TODO this isn't handling exploding die yet
  def roll_all_dice(count, type, roll_fn \\ &roll_die/0) do
    case count do
      0 ->
        []

      _ ->
        result = roll_fn.()
        [result | roll_all_dice(count - 1, type, roll_fn)]
    end
  end

  def handle_roll(str) do
    type = RollType.from_input(str)

    parts =
      Regex.split(@regex_split_on, str, include_captures: true, trim: true)
      |> Enum.map(&identify_part/1)
      |> Enum.filter(fn {type, _} -> type !== :invalid end)

    dice_to_roll = Enum.reduce(parts, %{mod: "+", total: 0}, &count_reduce_fn(&1, &2))
    roll_all_dice(dice_to_roll, type)
  end
end
