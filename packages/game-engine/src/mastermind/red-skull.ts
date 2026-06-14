import { Mastermind, Tactic, Wound } from "../base.js";
import type { GameState } from "../base.js";

export class TacticCosmicCubePower extends Tactic {
  constructor() {
    super("tactic-cosmic-cube", "Cosmic Cube Power");
  }
  onDefeat(state: GameState): GameState {
    return {
      ...state,
      player: {
        ...state.player,
        attackPoints: Math.max(0, state.player.attackPoints - 2),
      },
    };
  }
}

export class TacticHydraTroops extends Tactic {
  constructor() {
    super("tactic-hydra-troops", "HYDRA Troops");
  }
  onDefeat(state: GameState): GameState {
    const wound = new Wound(`wound-${Date.now()}`);
    return {
      ...state,
      player: {
        ...state.player,
        discard: [...state.player.discard, wound],
      },
    };
  }
}

export class TacticMasterStrike extends Tactic {
  constructor() {
    super("tactic-master-strike", "Master Strike");
  }
  onDefeat(state: GameState): GameState {
    return state.scheme.onSchemeTwist(state);
  }
}

export class TacticRiseOfRedSkull extends Tactic {
  constructor() {
    super("tactic-rise-of-red-skull", "Rise of Red Skull");
  }
  onDefeat(state: GameState): GameState {
    return state;
  }
}

export class RedSkull extends Mastermind {
  constructor() {
    super("red-skull", "Red Skull", [
      new TacticCosmicCubePower(),
      new TacticHydraTroops(),
      new TacticMasterStrike(),
      new TacticRiseOfRedSkull(),
    ]);
  }
}
