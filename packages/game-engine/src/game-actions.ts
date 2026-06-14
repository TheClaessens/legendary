import { type GameState, HeroCard } from "./base.js";

export function playCard(state: GameState, cardId: string): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot play card during ${state.phase} phase`);
  }

  const cardIndex = state.player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error(`Card ${cardId} not in hand`);
  }

  const card = state.player.hand[cardIndex];
  const newHand = state.player.hand.filter((_, i) => i !== cardIndex);
  let s: GameState = { ...state, player: { ...state.player, hand: newHand } };

  if (card instanceof HeroCard) {
    s = card.onPlay(s);
    s = {
      ...s,
      player: { ...s.player, playedThisTurn: [...s.player.playedThisTurn, card] },
    };
  }

  return s;
}
