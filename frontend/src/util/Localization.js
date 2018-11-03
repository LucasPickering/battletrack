import LocalizedStrings from 'react-localization';

import mapName from 'api-assets/dictionaries/telemetry/mapName.json';
import itemId from 'api-assets/dictionaries/telemetry/item/itemId.json';
import vehicleId from 'api-assets/dictionaries/telemetry/vehicle/vehicleId.json';
import damageCauserName from 'api-assets/dictionaries/telemetry/damageCauserName.json';

export default new LocalizedStrings({
  en: {
    specialMarks: {
      plane: 'Plane',
      whiteZones: 'Play Zones',
    },
    eventMarks: {
      Kill: { single: 'Kill', plural: 'Kills' },
      Death: { single: 'Death', plural: 'Deaths' },
      PlayerPosition: { single: 'Position', plural: 'Positions' },
      CarePackage: { single: 'Care Package', plural: 'Care Packages' },
    },
    maps: mapName,
    items: itemId,
    vehicles: vehicleId,
    damageCausers: damageCauserName,
  },
});
