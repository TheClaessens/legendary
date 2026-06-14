import { HeroCard } from "../base.js";
import type { GameState } from "../base.js";

export class ShieldAgent extends HeroCard {
  constructor(id: string) {
    super(id, "S.H.I.E.L.D. Agent");
  }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, recruitPoints: state.player.recruitPoints + 1 } };
  }
}

export class ShieldTrooper extends HeroCard {
  constructor(id: string) {
    super(id, "S.H.I.E.L.D. Trooper");
  }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 1 } };
  }
}
