from btcore.models import Match
from btcore.query import api, DevAPIQuerySet


class TelemetryQuerySet(DevAPIQuerySet):
    def _execute_api_query(self, match):
        """
        @brief      Gets telemetry data from the dev API, given a match ID. Looks up the match by
                    ID in the DB, which will fetch it from the API if necessary. Then, gets the
                    telemetry URL from the match data and fetches that from the API.

        @param      match  The match ID

        @return     Dict of match ID and telemetry data from the API.
        """
        match_obj = Match.objects.get(id=match)  # Will pull from the API if necessary
        return {
            'match_id': match,  # Include match ID in output
            'telemetry': api.get(match_obj.telemetry_url),  # Pull the data from the API
        }
