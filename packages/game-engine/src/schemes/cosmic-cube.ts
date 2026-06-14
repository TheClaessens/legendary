import { Scheme } from "../base.js";
import type { GameState } from "../base.js";

export class CosmicCubeScheme extends Scheme {
  constructor() {
    super("cosmic-cube", "Unleash the Power of the Cosmic Cube");
  }

  onSchemeTwist(state: GameState): GameState {
    return { ...state, schemeTwistCount: state.schemeTwistCount + 1 };
  }

  checkLoseCondition(state: GameState): boolean {
    return state.schemeTwistCount >= 5;
  }
}
