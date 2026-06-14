export type CardData = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type LiveGameState = {
  phase: string;
  scheme: { id: string; name: string };
  mastermind: { id: string; name: string; tactics: CardData[] };
  city: (CardData | null)[];
  sewers: CardData[];
  heroDeck: CardData[];
  hq: (CardData | null)[];
  villainDeck: CardData[];
  koPile: CardData[];
  schemeTwistCount: number;
  player: {
    deck: CardData[];
    hand: CardData[];
    discard: CardData[];
    victory: CardData[];
    playedThisTurn: CardData[];
    recruitPoints: number;
    attackPoints: number;
  };
};
