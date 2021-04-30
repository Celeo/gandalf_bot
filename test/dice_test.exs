defmodule Bot.Dice.Test do
  use ExUnit.Case
  alias Bot.Dice

  describe "handle_roll()" do
    test "returns no values for no dice" do
      results = Dice.handle_roll("")
      assert results == {Dice.RollType.Explode_10, []}
    end

    test "gets results with a static gen fn" do
      results = Dice.handle_roll("3", fn -> 8 end)
      assert results == {Dice.RollType.Explode_10, [{8, false}, {8, false}, {8, false}]}
    end

    test "handles exploding correctly" do
      :rand.seed(:exsss, {101, 102, 103})
      results = Dice.handle_roll("3 8again")

      assert results ==
               {Dice.RollType.Explode_8,
                [{8, false}, {4, true}, {5, false}, {9, false}, {2, true}]}
    end
  end

  describe "roll_results_to_string()" do
    test "handles empty results" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, []})
      assert result == "Did not roll any dice"
    end

    test "handles normal roll" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, [{10, false}, {4, true}]})
      assert result == "10 (4)"
    end

    test "handles exceptional results" do
      result =
        Dice.roll_results_to_string(
          {Dice.RollType.Explode_10, [{8, false}, {8, false}, {8, false}, {8, false}, {8, false}]}
        )

      assert result = "8 8 8 8 8\nExceptional success!"
    end

    test "handles failure results" do
      result = Dice.roll_results_to_string({Dice.RollType.Explode_10, [{1, false}]})
      assert result == "1\nFool of a Took!"
    end

    test "handles chance results" do
      result = Dice.roll_results_to_string({Dice.RollType.Chance, [{5, false}]})
      assert result == "Chance failed! (5)"
    end
  end
end
