export interface Root {
  lastUpdateId: number;
  requestedUpdateId: number;
  ttl: number;
  summary: Summary;
  sports: Sport[];
  countries: Country[];
  competitions: Competition[];
  competitors: Competitor[];
  games: Game[];
}

export interface Summary {}

export interface Sport {
  id: number;
  name: string;
  nameForURL: string;
  drawSupport: boolean;
  imageVersion: number;
}

export interface Country {
  id: number;
  name: string;
  totalGames?: number;
  liveGames?: number;
  nameForURL: string;
  imageVersion: number;
  isInternational?: boolean;
}

export interface Competition {
  id: number;
  countryId: number;
  sportId: number;
  name: string;
  hasStandings?: boolean;
  hasBrackets: boolean;
  nameForURL: string;
  totalGames?: number;
  liveGames?: number;
  popularityRank: number;
  hasActiveGames?: boolean;
  isTop?: boolean;
  imageVersion: number;
  currentStageType: number;
  color?: string;
  competitorsType: number;
  currentPhaseNum: number;
  currentSeasonNum: number;
  currentStageNum: number;
  hideOnCatalog: boolean;
  hideOnSearch: boolean;
  isInternational: boolean;
  shortName?: string;
  hasLiveStandings?: boolean;
  hasStandingsGroups?: boolean;
  longName?: string;
  createdAt?: string;
  currentPhaseName?: string;
}

export interface Competitor {
  id: number;
  createdAt?: string;
  countryId: number;
  sportId: number;
  name: string;
  symbolicName?: string;
  nameForURL: string;
  type: number;
  popularityRank: number;
  imageVersion: number;
  color: string;
  mainCompetitionId: number;
  hasSquad?: boolean;
  hasTransfers: boolean;
  competitorNum: number;
  hideOnSearch: boolean;
  hideOnCatalog: boolean;
  awayColor?: string;
  longName?: string;
  shortName?: string;
}

export interface Game {
  id: number;
  sportId: number;
  competitionId: number;
  seasonNum: number;
  stageNum: number;
  roundNum?: number;
  roundName: string;
  competitionDisplayName: string;
  startTime: string;
  statusGroup: number;
  statusText: string;
  shortStatusText: string;
  gameTimeAndStatusDisplayType: number;
  justEnded: boolean;
  gameTime: number;
  gameTimeDisplay: string;
  hasTVNetworks: boolean;
  hasBetsTeaser?: boolean;
  winDescription: string;
  homeCompetitor: HomeCompetitor;
  awayCompetitor: AwayCompetitor;
  isHomeAwayInverted: boolean;
  hasStats?: boolean;
  hasStandings: boolean;
  standingsName?: string;
  hasBrackets: boolean;
  hasPreviousMeetings: boolean;
  hasRecentMatches: boolean;
  hasBets?: boolean;
  hasPlayerBets?: boolean;
  winner: number;
  homeAwayTeamOrder: number;
  hasPointByPoint: boolean;
  hasVideo: boolean;
  hasLineups?: boolean;
  hasMissingPlayers?: boolean;
  hasFieldPositions?: boolean;
  lineupsStatus?: number;
  lineupsStatusText?: string;
  hasLiveStreaming?: boolean;
  stageName?: string;
  groupNum?: number;
  groupName?: string;
  competitionGroupByName?: string;
  addedTime?: number;
  hasNews?: boolean;
  animation?: Animation;
  showCountdown?: boolean;
  legNum?: number;
  aggregateText?: string;
  shortAggregateText?: string;
}

export interface HomeCompetitor {
  id: number;
  createdAt?: string;
  countryId: number;
  sportId: number;
  name: string;
  symbolicName?: string;
  score: number;
  isQualified: boolean;
  toQualify: boolean;
  isWinner: boolean;
  nameForURL: string;
  type: number;
  popularityRank: number;
  imageVersion: number;
  color: string;
  mainCompetitionId: number;
  hasSquad?: boolean;
  hasTransfers: boolean;
  competitorNum: number;
  hideOnSearch: boolean;
  hideOnCatalog: boolean;
  longName?: string;
  awayColor?: string;
  redCards?: number;
  shortName?: string;
  rankings?: Ranking[];
  aggregatedScore?: number;
}

export interface Ranking {
  name: string;
  position: number;
}

export interface AwayCompetitor {
  id: number;
  countryId: number;
  sportId: number;
  name: string;
  symbolicName?: string;
  score: number;
  isQualified: boolean;
  toQualify: boolean;
  isWinner: boolean;
  nameForURL: string;
  type: number;
  popularityRank: number;
  imageVersion: number;
  color: string;
  awayColor?: string;
  mainCompetitionId: number;
  hasSquad?: boolean;
  hasTransfers: boolean;
  competitorNum: number;
  hideOnSearch: boolean;
  hideOnCatalog: boolean;
  redCards?: number;
  longName?: string;
  createdAt?: string;
  shortName?: string;
  rankings?: Ranking2[];
  aggregatedScore?: number;
}

export interface Ranking2 {
  name: string;
  position: number;
}

export interface Animation {
  id: number;
  animationText: string;
  playerName: string;
  isHomeCompetitor: boolean;
  uniqueId: string;
}

export interface Root {
  lastUpdateId: number;
  requestedUpdateId: number;
  ttl: number;
  game: Game;
  sports: Sport[];
  countries: Country[];
  competitions: Competition[];
}

export interface PreciseGameTime {
  minutes: number;
  seconds: number;
  autoProgress: boolean;
  clockDirection: number;
}

export interface Lineups {
  status: string;
  formation: string;
  hasFieldPositions: boolean;
  members: Member[];
  statsCategory: StatsCategory[];
}

export interface Member {
  status: number;
  statusText: string;
  yardFormation?: YardFormation;
  ranking?: number;
  hasStats: boolean;
  stats?: Stat[];
  heatMap?: string;
  popularityRank: number;
  competitorId: number;
  id: number;
  hasShotChart?: boolean;
  position?: Position;
  formation?: Formation;
  nationalId?: number;
  hasHighestRanking?: boolean;
  substitution?: Substitution;
}

export interface YardFormation {
  line: number;
  fieldPosition: number;
  fieldLine?: number;
  fieldSide?: number;
}

export interface Stat {
  type: number;
  value: string;
  isTop?: boolean;
  categoryId: number;
  name: string;
  shortName?: string;
  order: number;
  imageId: number;
}

export interface Position {
  id: number;
  name: string;
  shortName: string;
}

export interface Formation {
  id: number;
  name: string;
  shortName: string;
}

export interface Substitution {
  playerId: number;
  time: number;
  type: number;
  status: number;
  eventOrder: number;
}

export interface StatsCategory {
  id: number;
  name: string;
  orderLevel: number;
  orderByPosition: OrderByPosition[];
}

export interface OrderByPosition {
  position: number;
  positionOrder: number;
}

export interface Lineups2 {
  status: string;
  formation: string;
  hasFieldPositions: boolean;
  members: Member2[];
  statsCategory: StatsCategory2[];
}

export interface Member2 {
  status: number;
  statusText: string;
  position: Position2;
  formation: Formation2;
  yardFormation?: YardFormation2;
  ranking?: number;
  hasStats: boolean;
  stats?: Stat2[];
  heatMap?: string;
  popularityRank: number;
  competitorId: number;
  nationalId: number;
  id: number;
  hasShotChart?: boolean;
  hasHighestRanking?: boolean;
  substitution?: Substitution2;
  injury?: Injury;
  seasonStats?: SeasonStat[];
}

export interface Position2 {
  id: number;
  name: string;
  shortName: string;
}

export interface Formation2 {
  id: number;
  name: string;
  shortName: string;
}

export interface YardFormation2 {
  line: number;
  fieldPosition: number;
  fieldLine?: number;
  fieldSide?: number;
}

export interface Stat2 {
  type: number;
  value: string;
  isTop?: boolean;
  categoryId: number;
  name: string;
  shortName?: string;
  order: number;
  imageId: number;
}

export interface Substitution2 {
  playerId: number;
  time: number;
  type: number;
  status: number;
  eventOrder: number;
}

export interface Injury {
  categoryId: number;
  reason: string;
  expectedReturn: string;
  imageId: string;
  imageVersion: number;
}

export interface SeasonStat {
  type: number;
  text: string;
  isSignificant?: boolean;
}

export interface StatsCategory2 {
  id: number;
  name: string;
  orderLevel: number;
  orderByPosition: OrderByPosition2[];
}

export interface OrderByPosition2 {
  position: number;
  positionOrder: number;
}

export interface Stage {
  id: number;
  name: string;
  shortName: string;
  homeCompetitorScore: number;
  awayCompetitorScore: number;
  isEnded: boolean;
  isCurrent?: boolean;
}

export interface Event {
  competitorId: number;
  statusId: number;
  stageId: number;
  order: number;
  num: number;
  gameTime: number;
  addedTime: number;
  gameTimeDisplay: string;
  gameTimeAndStatusDisplayType: number;
  playerId: number;
  extraPlayers?: number[];
  isMajor: boolean;
  eventType: EventType;
}

export interface EventType {
  id: number;
  name: string;
  subTypeId: number;
  subTypeName?: string;
}

export interface Venue {
  id: number;
  name: string;
  shortName: string;
  capacity: number;
}

export interface Official {
  id: number;
  athleteId: number;
  countryId: number;
  status: number;
  name: string;
  nameForURL: string;
}

export interface Member3 {
  competitorId: number;
  id: number;
  name: string;
  shortName: string;
  jerseyNumber: number;
  nameForURL: string;
  athleteId?: number;
  imageVersion?: number;
}

export interface Widget {
  provider: string;
  partnerId: string;
  widgetUrl: string;
  widgetRatio: number;
  widgetType: string;
}

export interface PromotedPredictions {
  predictions: Prediction[];
}

export interface Prediction {
  id: number;
  type: number;
  title: string;
  showVotes: boolean;
  totalVotes: number;
  odds: Odds;
  options: Option2[];
}

export interface Odds {
  lineId: number;
  gameId: number;
  bookmakerId: number;
  lineTypeId: number;
  lineType: LineType;
  bookmaker: Bookmaker;
  options: Option[];
  outcomeOptionNum: number;
  isConcluded: boolean;
  internalOption?: string;
  internalOptionValue?: string;
}

export interface LineType {
  id: number;
  name: string;
  title: string;
  internalOptionType: number;
}

export interface Bookmaker {
  id: number;
  name: string;
  nameForURL: string;
  color: string;
  imageVersion: number;
}

export interface Option {
  num: number;
  name: string;
  rate: Rate;
  bookmakerId: number;
  originalRate: OriginalRate;
  trend: number;
  isWon?: boolean;
}

export interface Rate {
  decimal: number;
  fractional: string;
  american: string;
}

export interface OriginalRate {
  decimal: number;
  fractional: string;
  american: string;
}

export interface Option2 {
  num: number;
  name: string;
  symbol: number;
  vote: Vote;
}

export interface Vote {
  count: number;
  key: string;
  percentage: number;
}

export interface PlayByPlay {
  feedURL: string;
  previewFeedUrl: string;
}

export interface ChartEvents {
  events: Event2[];
  eventTypes: EventType2[];
  statuses: Status[];
  eventSubTypes: EventSubType[];
}

export interface Event2 {
  xg: string;
  xgot: string;
  bodyPart: string;
  goalDescription?: string;
  key: string;
  competitorNum: number;
  time: string;
  status: number;
  playerId: number;
  line: number;
  side: number;
  type: number;
  subType?: number;
  gameId: number;
  outcome: Outcome;
}

export interface Outcome {
  y: number;
  z?: number;
  id: number;
  name: string;
  x?: number;
}

export interface EventType2 {
  id: number;
  value: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
  symbolName: string;
  aliasName: string;
  sportTypeId: number;
  isActive: boolean;
  isFinished: boolean;
  isNotStarted: boolean;
  isExtraTime: boolean;
  isPenalties: boolean;
  isAbnormal: boolean;
  gameTimeForStatus: boolean;
  autonomicTime: boolean;
  hasEvents: boolean;
}

export interface EventSubType {
  id: number;
  value: number;
  name: string;
}

export interface ActualPlayTime {
  title: string;
  actualTime: ActualTime;
  totalTime: TotalTime;
}

export interface ActualTime {
  name: string;
  progress: number;
}

export interface TotalTime {
  name: string;
  progress: number;
}
