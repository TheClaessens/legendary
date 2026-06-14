export interface Card {
  id: string;
  name: string;
}

export type TurnPhase = "VILLAIN_DECK_FLIP" | "MAIN" | "DRAW";

export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export type GameState = {
  phase: TurnPhase;
  status: GameStatus;
  scheme: Scheme;
  mastermind: Mastermind;
  city: (Villain | null)[];
  sewers: Villain[];
  heroDeck: HeroCard[];
  hq: (HeroCard | null)[];
  villainDeck: Card[];
  koPile: Card[];
  schemeTwistCount: number;
  player: {
    deck: Card[];
    hand: Card[];
    discard: Card[];
    victory: Card[];
    playedThisTurn: HeroCard[];
    recruitPoints: number;
    attackPoints: number;
  };
};

export abstract class HeroCard {
  abstract readonly cost: number;
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
  abstract onPlay(state: GameState): GameState;
}

export abstract class Villain {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly attackValue: number,
    public readonly vpValue: number,
  ) {}
  abstract onAmbush(state: GameState): GameState;
  abstract onEscape(state: GameState): GameState;
  abstract onFight(state: GameState): GameState;
}

export abstract class Tactic {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
  abstract onDefeat(state: GameState): GameState;
}

export class Mastermind {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tactics: Tactic[],
    public readonly attackValue: number = 10,
  ) {}
  onMasterStrike(state: GameState): GameState {
    return state;
  }
}

export abstract class Scheme {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
  onSchemeTwist(state: GameState): GameState {
    return state;
  }
  onVillainEscape(state: GameState): GameState {
    return state;
  }
  checkWinCondition(state: GameState): boolean {
    const tacticIds = new Set(state.mastermind.tactics.map((t) => t.id));
    if (tacticIds.size === 0) return false;
    const victoryIds = new Set(state.player.victory.map((c) => c.id));
    return [...tacticIds].every((id) => victoryIds.has(id));
  }
  checkLoseCondition(_state: GameState): boolean {
    return false;
  }
}

export class Bystander {
  readonly vpValue = 1;
  constructor(
    public readonly id: string,
    public readonly name: string = "Bystander",
  ) {}
}

export class Wound {
  readonly vpValue = 0;
  constructor(
    public readonly id: string,
    public readonly name: string = "Wound",
  ) {}
}

