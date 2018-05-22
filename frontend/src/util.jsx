import moment from 'moment';
import React from 'react';
import { Table } from 'react-bootstrap';

import Erangel from './images/maps/Erangel.jpg';

const MAP_IMAGES = {
  Erangel,
};

export function formatDate(date, format) {
  return moment(date).local().format(format);
}

export function formatSeconds(seconds, format = 'm[m] ss[s]') {
  return moment.utc(seconds * 1000).format(format);
}

export function formatGameMode(gameMode) {
  return gameMode.charAt(0).toUpperCase() + gameMode.slice(1); // Capitalize first letter
}

export function formatPerspective(perspective) {
  return perspective.toUpperCase();
}

export function formatShard(shard) {
  return shard.toUpperCase();
}

export function formatItem(item) {
  const { name, stack_count: stackCount } = item;
  return `${stackCount}x ${name}`;
}

export function mapImage(mapName) {
  return MAP_IMAGES[mapName];
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

export function overviewLink(matchId) {
  return `${matchLink(matchId)}/overview`;
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
  };
}

export function inRange(x, min, max) {
  return min <= x && x <= max;
}

export function range(start, end, step = 1) {
  const rv = new Array(Math.ceil((end - start) / step)); // Pre-allocate necessary space
  for (let i = start; i < end; i += step) {
    rv.push(i);
  }
  return rv;
}

export function routeComponent(component) {
  return ({ match, ...rest }) => React.createElement(component, { ...match.params, ...rest });
}
