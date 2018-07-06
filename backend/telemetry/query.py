from btcore.models import Match
from btcore.query import DevAPIQuerySet


class TelemetryQuerySet(DevAPIQuerySet):
    def _get_api_url(self, match_id):
        """
        @brief      Gets a URL telemetry data from the dev API, given a match ID. Looks up the match
                    by ID in the DB, which will fetch it from the API if necessary. Then, gets the
                    telemetry URL from the match data.

        @param      match  The match ID

        @return     Dict of match ID and telemetry data from the API.
        """
        # Will pull from the API if necessary
        return Match.objects.only('telemetry_url').get(id=match_id).telemetry_url
