export interface Card {
  id: string;
  name: string;
}

export type TurnPhase = "VILLAIN_DECK_FLIP" | "MAIN" | "DRAW";

export type GameState = {
  phase: TurnPhase;
  scheme: Scheme;
  mastermind: Mastermind;
  city: (Villain | null)[];
  sewers: Villain[];
  heroDeck: HeroCard[];
  hq: (HeroCard | null)[];
  villainDeck: Card[];
  koPile: Card[];
  player: {
    deck: Card[];
    hand: Card[];
    discard: Card[];
    victory: Card[];
    recruitPoints: number;
    attackPoints: number;
  };
};

export abstract class HeroCard {
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
  ) {}
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
  checkWinCondition(_state: GameState): boolean {
    return false;
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

