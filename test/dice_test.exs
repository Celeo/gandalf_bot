defmodule Bot.Dice.Test do
  use ExUnit.Case
  alias Bot.Dice

  describe "handle_roll()" do
    setup do
      on_exit(fn ->
        Bot.Util.Rng.clear_stored_numbers()
        :ok
      end)

      :ok
    end

    test "returns no values for no dice" do
      results = Dice.handle_roll("")
      assert results == {Dice.RollType.Explode_10, []}
    end

    test "gets results with a static gen fn" do
      Bot.Util.Rng.enqueue_static([8, 8, 8])
      results = Dice.handle_roll("3")
      assert results == {Dice.RollType.Explode_10, [{8, false}, {8, false}, {8, false}]}
    end

    test "handles exploding correctly" do
      Bot.Util.Rng.enqueue_static([8, 4, 5, 9, 2])
      results = Dice.handle_roll("3 8again")

      assert results ==
               {Dice.RollType.Explode_8,
                [{8, false}, {4, true}, {5, false}, {9, false}, {2, true}]}
    end

    test "handles math - addition" do
      Bot.Util.Rng.enqueue_static([8, 8, 8, 8, 8, 8])
      {_, results} = Dice.handle_roll("3 + 3")
      assert length(results) == 6
    end

    test "handles math - no modifiers" do
      Bot.Util.Rng.enqueue_static([8, 8, 8, 8, 8, 8])
      {_, results} = Dice.handle_roll("3 3")
      assert length(results) == 6
    end

    test "handles math - negative" do
      Bot.Util.Rng.enqueue_static([8])
      {_, results} = Dice.handle_roll("3 - 2")
      assert length(results) == 1
    end

    test "handles math - down to zero" do
      {_, results} = Dice.handle_roll("3 - 3")
      assert length(results) == 0
    end
  end

  describe "roll_results_to_string()" do
    test "handles empty results" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, []})
      assert result == "Did not roll any dice"
    end

    test "handles normal roll" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, [{10, false}, {4, true}]})
      assert result == "Successes: **1**\n10 (4)"
    end

    test "handles exceptional results" do
      result =
        Dice.roll_results_to_string(
          {Dice.RollType.Explode_10, [{8, false}, {8, false}, {8, false}, {8, false}, {8, false}]}
        )

      assert result == "Successes: **5**\n8 8 8 8 8\nExceptional success!"
    end

    test "handles failure results" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, [{1, false}]})
      assert result == "Successes: **0**\n1\nFool of a Took!"
    end

    test "handles chance results failure" do
      result = Dice.roll_results_to_string({Dice.RollType.Chance, [{5, false}]})
      assert result == "Chance failed! (5)"
    end

    test "handles chance results success" do
      result = Dice.roll_results_to_string({Dice.RollType.Chance, [{10, false}]})
      assert result == "Chance **succeeded**! (10)"
    end
  end
end
