defmodule Bot.Dice do
  use EnumType
  require Logger

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

  defp roll_all_dice(count, type, roll_fn, is_bonus \\ false) do
    case count do
      # if no dice to roll, then return empty array for recursion termination
      0 ->
        []

      # otherwise,
      _ ->
        # roll a single die
        result = roll_fn.()
        # check if it should explode
        {_, explode_threshold} = type.value()
        should_explode = result >= explode_threshold

        # check explosion and whether this roll is already a bonus
        case {should_explode, is_bonus} do
          # no explosion? keep rolling the rest, reset is_bonus to false
          {false, b} -> [{result, b} | roll_all_dice(count - 1, type, roll_fn, false)]
          # explosion? keep rolling, set is_bonus to true
          {true, b} -> [{result, b} | roll_all_dice(count, type, roll_fn, true)]
        end
    end
  end

  def handle_roll(str, roll_fn \\ &roll_die/0) do
    type = RollType.from_input(str)

    parts =
      Regex.split(@regex_split_on, str, include_captures: true, trim: true)
      |> Enum.map(&identify_part/1)
      |> Enum.filter(fn {type, _} -> type !== :invalid end)

    # TODO handle rote

    dice_setup = Enum.reduce(parts, %{mod: "+", total: 0}, &count_reduce_fn(&1, &2))

    {type, roll_all_dice(dice_setup[:total], type, roll_fn)}
  end

  def roll_results_to_string({type, results}) do
    case results do
      [] ->
        "Did not roll any dice"

      results ->
        success_count = Enum.count(results, fn {value, _} -> value >= 8 end)

        dice_str =
          Enum.map(results, fn {value, bonus} ->
            case bonus do
              true -> "(#{value})"
              false -> "#{value}"
            end
          end)
          |> Enum.join(" ")
          |> String.trim()

        # TODO handle rote

        case type do
          Bot.Dice.RollType.Chance ->
            "Chance failed! (#{dice_str})"

          _ ->
            case success_count do
              0 -> "#{dice_str}\nFool of a Took!"
              n when n >= 5 -> "#{dice_str}\nExceptional success!"
              _ -> "#{dice_str}"
            end
        end
    end
  end
end
