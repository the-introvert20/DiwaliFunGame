import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class RocketPlayer extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") avatar: string = "";
  @type("string") color: string = "#ffc16c";
  @type("number") x: number = 0.5; // 0 (left) to 1 (right)
  @type("number") y: number = 0;   // track progress distance
  @type("number") speed: number = 280; // km/h
  @type("number") targetX: number = 0.5;
  @type("boolean") isBoosting: boolean = false;
  @type("boolean") isShielded: boolean = false;
  @type("number") boostCharge: number = 85; // 0 to 100
  @type("number") lap: number = 1;
  @type("boolean") isReady: boolean = false;
  @type("boolean") finished: boolean = false;
  @type("number") finishTime: number = 0;
  @type("number") rank: number = 1;
  @type("number") ping: number = 18;
}

export class RocketObstacleState extends Schema {
  @type("string") id: string = "";
  @type("string") obstacleType: string = "lantern"; // lantern, boost_pad, diya_gate
  @type("number") x: number = 0.5;
  @type("number") y: number = 0;
  @type("boolean") active: boolean = true;
}

export class RocketRushState extends Schema {
  @type("string") status: string = "waiting"; // waiting, countdown, racing, finished
  @type("number") countdown: number = 3;
  @type("number") trackLength: number = 5000; // meters per lap
  @type("number") lapsCount: number = 3;
  @type("number") raceStartTime: number = 0;
  @type("string") winnerId: string = "";
  @type("string") winnerName: string = "";

  @type({ map: RocketPlayer }) players = new MapSchema<RocketPlayer>();
  @type([RocketObstacleState]) obstacles = new ArraySchema<RocketObstacleState>();
}

