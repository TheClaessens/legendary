import { HeroCard, Wound } from "../base.js";
import type { GameState } from "../base.js";

abstract class WolverineHeroCard extends HeroCard {
  readonly team = "Wolverine";
}

function hasTeamBonus(state: GameState): boolean {
  return state.player.playedThisTurn.some((c) => c instanceof WolverineHeroCard);
}

export class WolverineAdamantiumClaws extends WolverineHeroCard {
  constructor() { super("wol-adamantium-claws", "Wolverine: Adamantium Claws"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 5 } };
  }
}

export class WolverineAdamantiumSkeleton extends WolverineHeroCard {
  constructor() { super("wol-adamantium-skeleton", "Wolverine: Adamantium Skeleton"); }
  onPlay(state: GameState): GameState {
    const bonus = hasTeamBonus(state) ? 2 : 0;
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 3 + bonus } };
  }
}

export class WolverineHealingFactor extends WolverineHeroCard {
  constructor() { super("wol-healing-factor", "Wolverine: Healing Factor"); }
  onPlay(state: GameState): GameState {
    let hand = state.player.hand;
    if (hasTeamBonus(state)) {
      const woundIdx = hand.findIndex((c) => c instanceof Wound);
      if (woundIdx !== -1) {
        hand = [...hand.slice(0, woundIdx), ...hand.slice(woundIdx + 1)];
      }
    }
    return {
      ...state,
      player: {
        ...state.player,
        hand,
        attackPoints: state.player.attackPoints + 2,
        recruitPoints: state.player.recruitPoints + 1,
      },
    };
  }
}

export class WolverineUndying extends WolverineHeroCard {
  constructor() { super("wol-undying", "Wolverine: Undying"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 3 } };
  }
}

export class WolverineBerserkerRage extends WolverineHeroCard {
  constructor() { super("wol-berserker-rage", "Wolverine: Berserker Rage"); }
  onPlay(state: GameState): GameState {
    return {
      ...state,
      player: {
        ...state.player,
        attackPoints: state.player.attackPoints + 4,
        recruitPoints: state.player.recruitPoints + 1,
      },
    };
  }
}
