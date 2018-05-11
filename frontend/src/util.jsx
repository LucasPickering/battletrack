import moment from 'moment';
import React from 'react';
import { Table } from 'react-bootstrap';

const MAP_NAMES = {
  Erangel_Main: 'Erangel',
  Desert_Main: 'Miramar',
};

export function formatDate(date, format) {
  return moment(date).local().format(format);
}

export function formatSeconds(seconds) {
  return moment.utc(seconds * 1000).format('m[m] ss[s]');
}

export function formatGameMode(gameMode) {
  return gameMode.charAt(0).toUpperCase() + gameMode.slice(1);  // Capitalize first letter
}

export function formatPerspective(perspective) {
  return perspective.toUpperCase();
}

export function formatMap(mapName) {
  return MAP_NAMES[mapName];
}

export function makeTable(rows) {
  return (
    <Table>
      <tbody>
        {rows.map(([title, data]) => <tr key={title}><th>{title}</th><td>{data}</td></tr>)}
      </tbody>
    </Table>
  );
}

export function matchLink(matchId) {
  return `/matches/${matchId}`;
}

export function playerLink(shard, playerName) {
  return `/players/${shard}/${playerName}`;
}

export function sortKeyFunc(keyFunc, invert = false) {
  return (e1, e2) => {
    const [k1, k2] = [e1, e2].map(keyFunc); // Apply the key extractor to each element
    if (k1 < k2) {
      return invert ? 1 : -1;
    } else if (k2 < k1) {
      return invert ? -1 : 1;
    }
    return 0;
  }
}
