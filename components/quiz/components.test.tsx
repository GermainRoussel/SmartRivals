// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnagramQuestion } from "./types/AnagramQuestion";
import { TrueFalseQuestion } from "./types/TrueFalseQuestion";
import { HoleTextQuestion } from "./types/HoleTextQuestion";
import { QuestionPlayer } from "./QuestionPlayer";
import { Question, QuestionType, QuestionTheme, QuestionDifficulty } from "@/types";

function q(p: Partial<Question> & { type: QuestionType }): Question {
  return {
    id: "t",
    text: "",
    theme: QuestionTheme.LOGIC,
    difficulty: QuestionDifficulty.EASY,
    ...p,
  } as Question;
}

/** Click the only *enabled* button whose text is exactly `text`. */
function clickEnabled(text: string) {
  const btn = screen
    .getAllByRole("button")
    .find((b) => b.textContent === text && !(b as HTMLButtonElement).disabled);
  if (!btn) throw new Error(`no enabled button "${text}"`);
  fireEvent.click(btn);
}

describe("TrueFalseQuestion", () => {
  it("reports the chosen boolean", () => {
    const onAnswer = vi.fn();
    render(<TrueFalseQuestion question={q({ type: QuestionType.TRUE_FALSE })} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("Vrai"));
    expect(onAnswer).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByText("Faux"));
    expect(onAnswer).toHaveBeenLastCalledWith(false);
  });
});

describe("AnagramQuestion", () => {
  it("assembles the word, then clears the answer when a tile is removed", () => {
    const onAnswer = vi.fn();
    render(
      <AnagramQuestion
        question={q({ type: QuestionType.ANAGRAM, anagramWord: "CHAT" })}
        onAnswer={onAnswer}
      />,
    );
    ["C", "H", "A", "T"].forEach(clickEnabled);
    expect(onAnswer).toHaveBeenLastCalledWith("CHAT");

    // Removing a placed tile must drop the stale complete answer (P2 fix).
    clickEnabled("C");
    expect(onAnswer).toHaveBeenLastCalledWith("");
  });
});

describe("HoleTextQuestion", () => {
  it("fills the hole from the word bank", () => {
    const onAnswer = vi.fn();
    render(
      <HoleTextQuestion
        question={q({ type: QuestionType.HOLE_TEXT, holeText: "Je suis ton {père}." })}
        onAnswer={onAnswer}
      />,
    );
    fireEvent.click(screen.getByText("père"));
    expect(onAnswer).toHaveBeenLastCalledWith(["père"]);
  });
});

describe("QuestionPlayer auto-validation", () => {
  it("auto-submits an anagram once complete, with no Valider button", () => {
    const onResult = vi.fn();
    render(
      <QuestionPlayer
        question={q({ type: QuestionType.ANAGRAM, anagramWord: "CHAT", correctAnswer: "CHAT" })}
        onResult={onResult}
      />,
    );
    expect(screen.queryByText("Valider")).toBeNull();

    ["C", "H", "A", "T"].forEach(clickEnabled);
    expect(onResult).toHaveBeenCalledWith(true, "CHAT");
  });
});
