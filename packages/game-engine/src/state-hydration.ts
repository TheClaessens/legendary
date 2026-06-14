import type { GameState, Card } from "./base.js";
import { Bystander, Villain, HeroCard, Scheme, Mastermind } from "./base.js";
import { BaronStrucker, HydraAssassin, HydraSoldier, MadameHydra } from "./villains/hydra.js";
import { CosmicCubeScheme } from "./schemes/cosmic-cube.js";
import { RedSkull } from "./mastermind/red-skull.js";
import {
  IronManBlazingRepulsor,
  IronManInvincibleArmor,
  IronManExothermicBlast,
  IronManThinkSmarter,
  IronManThinkingCap,
} from "./heroes/iron-man.js";
import {
  SpiderManAgileDefense,
  SpiderManWebSwing,
  SpiderManAmazingFantasy,
  SpiderManWallCrawling,
  SpiderManSpiderSense,
} from "./heroes/spider-man.js";
import {
  WolverineAdamantiumClaws,
  WolverineAdamantiumSkeleton,
  WolverineHealingFactor,
  WolverineUndying,
  WolverineBerserkerRage,
} from "./heroes/wolverine.js";
import { ShieldAgent, ShieldTrooper } from "./heroes/shield.js";

type PlainCard = { id: string; name: string; [key: string]: unknown };

function hydrateVillainCard(plain: PlainCard): Card {
  switch (plain.name) {
    case "Baron Strucker": return new BaronStrucker();
    case "HYDRA Assassin": return new HydraAssassin();
    case "HYDRA Soldier": return new HydraSoldier();
    case "Madame Hydra": return new MadameHydra();
    case "Bystander": return new Bystander(plain.id);
    default: return { id: plain.id, name: plain.name };
  }
}

function hydrateHeroCard(plain: PlainCard): HeroCard {
  switch (plain.id) {
    case "im-blazing-repulsor": return new IronManBlazingRepulsor();
    case "im-invincible-armor": return new IronManInvincibleArmor();
    case "im-exothermic-blast": return new IronManExothermicBlast();
    case "im-think-smarter": return new IronManThinkSmarter();
    case "im-thinking-cap": return new IronManThinkingCap();
    case "sm-agile-defense": return new SpiderManAgileDefense();
    case "sm-web-swing": return new SpiderManWebSwing();
    case "sm-amazing-fantasy": return new SpiderManAmazingFantasy();
    case "sm-wall-crawling": return new SpiderManWallCrawling();
    case "sm-spider-sense": return new SpiderManSpiderSense();
    case "wol-adamantium-claws": return new WolverineAdamantiumClaws();
    case "wol-adamantium-skeleton": return new WolverineAdamantiumSkeleton();
    case "wol-healing-factor": return new WolverineHealingFactor();
    case "wol-undying": return new WolverineUndying();
    case "wol-berserker-rage": return new WolverineBerserkerRage();
    default:
      if (plain.name === "S.H.I.E.L.D. Agent") return new ShieldAgent(plain.id);
      if (plain.name === "S.H.I.E.L.D. Trooper") return new ShieldTrooper(plain.id);
      throw new Error(`Unknown hero card: ${plain.id} / ${plain.name}`);
  }
}

function hydrateScheme(plain: PlainCard): Scheme {
  switch (plain.id) {
    case "cosmic-cube": return new CosmicCubeScheme();
    default: throw new Error(`Unknown scheme: ${plain.id}`);
  }
}

function hydrateMastermind(plain: PlainCard): Mastermind {
  switch (plain.id) {
    case "red-skull": return new RedSkull();
    default: throw new Error(`Unknown mastermind: ${plain.id}`);
  }
}

export function hydrateState(plain: Record<string, unknown>): GameState {
  const scheme = hydrateScheme(plain.scheme as PlainCard);
  const mastermind = hydrateMastermind(plain.mastermind as PlainCard);
  const villainDeck = (plain.villainDeck as PlainCard[]).map(hydrateVillainCard);
  const city = (plain.city as (PlainCard | null)[]).map(
    (v) => (v === null ? null : (hydrateVillainCard(v) as Villain | null)),
  );
  const sewers = (plain.sewers as PlainCard[]).map(
    (v) => hydrateVillainCard(v) as Villain,
  );
  const heroDeck = (plain.heroDeck as PlainCard[]).map(hydrateHeroCard);
  const hq = (plain.hq as (PlainCard | null)[]).map(
    (c) => (c === null ? null : hydrateHeroCard(c)),
  );
  const player = plain.player as {
    deck: PlainCard[];
    hand: PlainCard[];
    discard: PlainCard[];
    victory: PlainCard[];
    playedThisTurn: PlainCard[];
    recruitPoints: number;
    attackPoints: number;
  };

  return {
    phase: plain.phase as GameState["phase"],
    status: (plain.status as GameState["status"]) ?? "IN_PROGRESS",
    scheme,
    mastermind,
    city,
    sewers,
    heroDeck,
    hq,
    villainDeck,
    koPile: (plain.koPile as PlainCard[]).map((c) => ({ id: c.id, name: c.name })),
    schemeTwistCount: plain.schemeTwistCount as number,
    player: {
      deck: player.deck.map((c) => ({ id: c.id, name: c.name })),
      hand: player.hand.map((c) => ({ id: c.id, name: c.name })),
      discard: player.discard.map((c) => ({ id: c.id, name: c.name })),
      victory: player.victory.map((c) => ({ id: c.id, name: c.name })),
      playedThisTurn: player.playedThisTurn.map(hydrateHeroCard),
      recruitPoints: player.recruitPoints,
      attackPoints: player.attackPoints,
    },
  };
}
