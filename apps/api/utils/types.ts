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
