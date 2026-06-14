import { type GameState, HeroCard, Villain, type Card } from "./base.js";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function playCard(state: GameState, cardId: string): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot play card during ${state.phase} phase`);
  }

  const cardIndex = state.player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error(`Card ${cardId} not in hand`);
  }

  const card = state.player.hand[cardIndex];
  const newHand = state.player.hand.filter((_, i) => i !== cardIndex);
  let s: GameState = { ...state, player: { ...state.player, hand: newHand } };

  if (card instanceof HeroCard) {
    s = card.onPlay(s);
    s = {
      ...s,
      player: { ...s.player, playedThisTurn: [...s.player.playedThisTurn, card] },
    };
  }

  return s;
}

export function recruitHero(state: GameState, hqSlot: number): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot recruit during ${state.phase} phase`);
  }

  const hero = state.hq[hqSlot];
  if (!hero) {
    throw new Error(`HQ slot ${hqSlot} is empty`);
  }

  if (state.player.recruitPoints < hero.cost) {
    throw new Error(`Insufficient recruit points: need ${hero.cost}, have ${state.player.recruitPoints}`);
  }

  const newHq = [...state.hq] as (HeroCard | null)[];
  const [refill, ...remainingHeroDeck] = state.heroDeck;
  newHq[hqSlot] = refill ?? null;

  return {
    ...state,
    hq: newHq,
    heroDeck: remainingHeroDeck,
    player: {
      ...state.player,
      discard: [...state.player.discard, hero],
      recruitPoints: state.player.recruitPoints - hero.cost,
    },
  };
}

export function fightVillain(state: GameState, cityIndex: number): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot fight during ${state.phase} phase`);
  }

  const villain = state.city[cityIndex];
  if (!villain) {
    throw new Error(`City slot ${cityIndex} is empty`);
  }

  if (state.player.attackPoints < villain.attackValue) {
    throw new Error(`Insufficient attack points: need ${villain.attackValue}, have ${state.player.attackPoints}`);
  }

  const newCity = [...state.city] as (Villain | null)[];
  newCity[cityIndex] = null;

  let s: GameState = {
    ...state,
    city: newCity,
    player: {
      ...state.player,
      attackPoints: state.player.attackPoints - villain.attackValue,
      victory: [...state.player.victory, villain],
    },
  };

  s = villain.onFight(s);
  return s;
}

export function fightMastermind(state: GameState): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot fight mastermind during ${state.phase} phase`);
  }

  const { mastermind } = state;
  if (state.player.attackPoints < mastermind.attackValue) {
    throw new Error(
      `Insufficient attack points: need ${mastermind.attackValue}, have ${state.player.attackPoints}`,
    );
  }

  const defeatedIds = new Set(state.player.victory.map((c) => c.id));
  const tactic = mastermind.tactics.find((t) => !defeatedIds.has(t.id));
  if (!tactic) {
    throw new Error("All tactics already defeated");
  }

  let s: GameState = {
    ...state,
    player: {
      ...state.player,
      attackPoints: state.player.attackPoints - mastermind.attackValue,
      victory: [...state.player.victory, tactic],
    },
  };

  s = tactic.onDefeat(s);

  const allTacticsDefeated = mastermind.tactics.every((t) =>
    s.player.victory.some((c) => c.id === t.id),
  );

  if (allTacticsDefeated) {
    s = { ...s, status: "WON" };
  }

  return s;
}

export function endTurn(state: GameState): GameState {
  if (state.phase !== "MAIN") {
    throw new Error(`Cannot end turn during ${state.phase} phase`);
  }

  const discarded = [...state.player.hand, ...state.player.playedThisTurn] as Card[];
  let deck = state.player.deck;

  if (deck.length < 6) {
    deck = shuffleArray([...deck, ...state.player.discard, ...discarded]);
    const drawn = deck.slice(0, 6);
    return {
      ...state,
      phase: "VILLAIN_DECK_FLIP",
      player: {
        ...state.player,
        hand: drawn,
        deck: deck.slice(6),
        discard: [],
        playedThisTurn: [],
        recruitPoints: 0,
        attackPoints: 0,
      },
    };
  }

  const drawn = deck.slice(0, 6);
  return {
    ...state,
    phase: "VILLAIN_DECK_FLIP",
    player: {
      ...state.player,
      hand: drawn,
      deck: deck.slice(6),
      discard: [...state.player.discard, ...discarded],
      playedThisTurn: [],
      recruitPoints: 0,
      attackPoints: 0,
    },
  };
}
