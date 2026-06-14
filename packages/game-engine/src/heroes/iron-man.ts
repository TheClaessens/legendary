import { HeroCard } from "../base.js";
import type { GameState } from "../base.js";

const TEAM = "Iron Man";

function hasTeamBonus(state: GameState): boolean {
  return state.player.playedThisTurn.some(
    (c) => c instanceof IronManHeroCard,
  );
}

abstract class IronManHeroCard extends HeroCard {
  readonly team = TEAM;
}

export class IronManBlazingRepulsor extends IronManHeroCard {
  constructor() { super("im-blazing-repulsor", "Iron Man: Blazing Repulsor"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 4 } };
  }
}

export class IronManInvincibleArmor extends IronManHeroCard {
  constructor() { super("im-invincible-armor", "Iron Man: Invincible Armor"); }
  onPlay(state: GameState): GameState {
    const bonus = hasTeamBonus(state) ? 2 : 0;
    return {
      ...state,
      player: {
        ...state.player,
        attackPoints: state.player.attackPoints + 2 + bonus,
        recruitPoints: state.player.recruitPoints + 1,
      },
    };
  }
}

export class IronManExothermicBlast extends IronManHeroCard {
  constructor() { super("im-exothermic-blast", "Iron Man: Exothermic Blast"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 5 } };
  }
}

export class IronManThinkSmarter extends IronManHeroCard {
  constructor() { super("im-think-smarter", "Iron Man: Think Smarter"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, recruitPoints: state.player.recruitPoints + 3 } };
  }
}

export class IronManThinkingCap extends IronManHeroCard {
  constructor() { super("im-thinking-cap", "Iron Man: Thinking Cap"); }
  onPlay(state: GameState): GameState {
    const bonus = hasTeamBonus(state) ? 2 : 0;
    return {
      ...state,
      player: { ...state.player, recruitPoints: state.player.recruitPoints + 5 + bonus },
    };
  }
}
