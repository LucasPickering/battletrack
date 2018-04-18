import moment from 'moment';
import React from 'react';
import { Table } from 'react-bootstrap';

const GAME_MODES = {
  'solo-tpp': 'Solo TPP',
  'duo-tpp': 'Duo TPP',
  'squad-tpp': 'Squad TPP',
  'solo-fpp': 'Solo FPP',
  'duo-fpp': 'Duo FPP',
  'squad-fpp': 'Squad FPP',
}

const MAP_NAMES = {
  Erangel_Main: 'Erangel',
  Desert_Main: 'Miramar',
};

export function formatDate(date) {
  return moment(date).local().format('MMMM D, YYYY HH:mm:ss');
}

export function formatSeconds(seconds) {
  return moment.utc(seconds * 1000).format('m[m] ss[s]');
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

export function playerLink(playerName) {
  return `/players/${playerName}`;
}

export function sortKeyFunc(keyFunc) {
  return (e1, e2) => {
    const [k1, k2] = [e1, e2].map(keyFunc); // Apply the key extractor to each element
    if (k1 < k2) {
      return -1;
    } else if (k2 < k1) {
      return 1;
    }
    return 0;
  }
}

export function translateGameMode(gameMode) {
  return GAME_MODES[gameMode];
}

export function translateMap(mapName) {
  return MAP_NAMES[mapName];
}
