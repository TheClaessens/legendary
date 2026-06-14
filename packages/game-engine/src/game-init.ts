import type { GameState, HeroCard, Card } from "./base.js";
import { Bystander } from "./base.js";
import { RedSkull } from "./mastermind/red-skull.js";
import { CosmicCubeScheme } from "./schemes/cosmic-cube.js";
import { BaronStrucker, HydraAssassin, HydraSoldier, MadameHydra } from "./villains/hydra.js";
import { ShieldAgent, ShieldTrooper } from "./heroes/shield.js";
import {
  IronManBlazingRepulsor,
  IronManExothermicBlast,
  IronManInvincibleArmor,
  IronManThinkSmarter,
  IronManThinkingCap,
} from "./heroes/iron-man.js";
import {
  SpiderManAgileDefense,
  SpiderManAmazingFantasy,
  SpiderManSpiderSense,
  SpiderManWallCrawling,
  SpiderManWebSwing,
} from "./heroes/spider-man.js";
import {
  WolverineAdamantiumClaws,
  WolverineAdamantiumSkeleton,
  WolverineBerserkerRage,
  WolverineHealingFactor,
  WolverineUndying,
} from "./heroes/wolverine.js";

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialState(): GameState {
  const scheme = new CosmicCubeScheme();
  const mastermind = new RedSkull();

  const playerDeck: HeroCard[] = shuffle([
    ...Array.from({ length: 8 }, (_, i) => new ShieldAgent(`agent-${i}`)),
    ...Array.from({ length: 4 }, (_, i) => new ShieldTrooper(`trooper-${i}`)),
  ]);

  const heroDeckCards: HeroCard[] = shuffle([
    new IronManBlazingRepulsor(),
    new IronManInvincibleArmor(),
    new IronManExothermicBlast(),
    new IronManThinkSmarter(),
    new IronManThinkingCap(),
    new SpiderManAgileDefense(),
    new SpiderManWebSwing(),
    new SpiderManAmazingFantasy(),
    new SpiderManWallCrawling(),
    new SpiderManSpiderSense(),
    new WolverineAdamantiumClaws(),
    new WolverineAdamantiumSkeleton(),
    new WolverineHealingFactor(),
    new WolverineUndying(),
    new WolverineBerserkerRage(),
  ]);

  const hq: (HeroCard | null)[] = heroDeckCards.splice(0, 5);

  const villainDeck: Card[] = shuffle([
    new BaronStrucker(), new BaronStrucker(),
    new HydraAssassin(), new HydraAssassin(), new HydraAssassin(),
    new HydraSoldier(), new HydraSoldier(), new HydraSoldier(),
    new MadameHydra(), new MadameHydra(),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `scheme-twist-${i}`, name: "Scheme Twist" })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `master-strike-${i}`, name: "Master Strike" })),
    ...Array.from({ length: 4 }, (_, i) => new Bystander(`bystander-${i}`)),
  ]);

  return {
    phase: "VILLAIN_DECK_FLIP",
    scheme,
    mastermind,
    city: [null, null, null, null, null],
    sewers: [],
    heroDeck: heroDeckCards,
    hq,
    villainDeck,
    koPile: [],
    schemeTwistCount: 0,
    player: {
      deck: playerDeck,
      hand: [],
      discard: [],
      victory: [],
      playedThisTurn: [],
      recruitPoints: 0,
      attackPoints: 0,
    },
  };
}
