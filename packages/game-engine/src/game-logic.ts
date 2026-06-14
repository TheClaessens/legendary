import { type GameState, Villain, Bystander } from "./base.js";

export function applyStatusChecks(state: GameState): GameState {
  if (state.status !== "IN_PROGRESS") return state;
  if (state.scheme.checkLoseCondition(state)) return { ...state, status: "LOST" };
  if (state.scheme.checkWinCondition(state)) return { ...state, status: "WON" };
  return state;
}

export function flipVillainDeck(state: GameState): GameState {
  if (state.villainDeck.length === 0) return state;

  const [card, ...rest] = state.villainDeck;
  let s: GameState = { ...state, villainDeck: rest };

  if (card instanceof Villain) {
    s = card.onAmbush(s);

    const displaced = s.city[4];
    s = {
      ...s,
      city: [card, s.city[0], s.city[1], s.city[2], s.city[3]],
    };

    if (displaced !== null) {
      s = displaced.onEscape(s);
      s = { ...s, sewers: [...s.sewers, displaced] };
    }
  } else if (card instanceof Bystander) {
    s = { ...s, koPile: [...s.koPile, card] };
  } else if (card.name === "Scheme Twist") {
    s = s.scheme.onSchemeTwist(s);
  } else if (card.name === "Master Strike") {
    s = s.mastermind.onMasterStrike(s);
  }

  const lost = s.scheme.checkLoseCondition(s);
  s = {
    ...s,
    phase: "MAIN",
    status: lost ? "LOST" : s.status,
  };

  return s;
}
