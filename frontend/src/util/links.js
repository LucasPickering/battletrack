export function mapImage(mapKey) {
  return `/assets/maps/${mapKey}.jpg`;
}

export function matchLink(matchId) {
  return `/matches/${matchId}`;
}

export function overviewLink(matchId) {
  return `${matchLink(matchId)}/overview`;
}

export function playerLink(shard, playerName) {
  return `/players/${shard}/${playerName}`;
}
