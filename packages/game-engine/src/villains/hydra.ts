import { Villain, Wound } from "../base.js";
import type { GameState } from "../base.js";

export class BaronStrucker extends Villain {
  constructor() {
    super("baron-strucker", "Baron Strucker", 7, 4);
  }
  onAmbush(state: GameState): GameState {
    const wound = new Wound(`wound-${Date.now()}`);
    return {
      ...state,
      player: {
        ...state.player,
        discard: [...state.player.discard, wound],
      },
    };
  }
  onEscape(state: GameState): GameState {
    return state;
  }
  onFight(state: GameState): GameState {
    return state;
  }
}

export class HydraSoldier extends Villain {
  constructor() {
    super("hydra-soldier", "HYDRA Soldier", 3, 1);
  }
  onAmbush(state: GameState): GameState {
    return state;
  }
  onEscape(state: GameState): GameState {
    return state;
  }
  onFight(state: GameState): GameState {
    return state;
  }
}

export class HydraAssassin extends Villain {
  constructor() {
    super("hydra-assassin", "HYDRA Assassin", 4, 2);
  }
  onAmbush(state: GameState): GameState {
    return state;
  }
  onEscape(state: GameState): GameState {
    return state;
  }
  onFight(state: GameState): GameState {
    const [topCard, ...remainingDeck] = state.player.deck;
    if (!topCard) return state;
    return {
      ...state,
      player: {
        ...state.player,
        deck: remainingDeck,
        discard: [...state.player.discard, topCard],
      },
    };
  }
}

export class MadameHydra extends Villain {
  constructor() {
    super("madame-hydra", "Madame Hydra", 5, 3);
  }
  onAmbush(state: GameState): GameState {
    return state;
  }
  onEscape(state: GameState): GameState {
    return state.scheme.onVillainEscape(state);
  }
  onFight(state: GameState): GameState {
    return state;
  }
}
