import { HeroCard } from "../base.js";
import type { GameState } from "../base.js";

abstract class SpiderManHeroCard extends HeroCard {
  readonly team = "Spider-Man";
}

function hasTeamBonus(state: GameState): boolean {
  return state.player.playedThisTurn.some((c) => c instanceof SpiderManHeroCard);
}

export class SpiderManAgileDefense extends SpiderManHeroCard {
  readonly cost = 3;
  constructor() { super("sm-agile-defense", "Spider-Man: Agile Defense"); }
  onPlay(state: GameState): GameState {
    return {
      ...state,
      player: {
        ...state.player,
        attackPoints: state.player.attackPoints + 2,
        recruitPoints: state.player.recruitPoints + 1,
      },
    };
  }
}

export class SpiderManWebSwing extends SpiderManHeroCard {
  readonly cost = 4;
  constructor() { super("sm-web-swing", "Spider-Man: Web Swing"); }
  onPlay(state: GameState): GameState {
    const bonus = hasTeamBonus(state) ? 3 : 0;
    return {
      ...state,
      player: {
        ...state.player,
        attackPoints: state.player.attackPoints + 3,
        recruitPoints: state.player.recruitPoints + bonus,
      },
    };
  }
}

export class SpiderManAmazingFantasy extends SpiderManHeroCard {
  readonly cost = 4;
  constructor() { super("sm-amazing-fantasy", "Spider-Man: Amazing Fantasy"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, recruitPoints: state.player.recruitPoints + 4 } };
  }
}

export class SpiderManWallCrawling extends SpiderManHeroCard {
  readonly cost = 3;
  constructor() { super("sm-wall-crawling", "Spider-Man: Wall Crawling"); }
  onPlay(state: GameState): GameState {
    return { ...state, player: { ...state.player, attackPoints: state.player.attackPoints + 3 } };
  }
}

export class SpiderManSpiderSense extends SpiderManHeroCard {
  readonly cost = 4;
  constructor() { super("sm-spider-sense", "Spider-Man: Spider-Sense"); }
  onPlay(state: GameState): GameState {
    const bonus = hasTeamBonus(state) ? 2 : 0;
    return {
      ...state,
      player: {
        ...state.player,
        recruitPoints: state.player.recruitPoints + 2,
        attackPoints: state.player.attackPoints + bonus,
      },
    };
  }
}
