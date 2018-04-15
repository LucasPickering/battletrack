from django.conf.urls import include, url

from . import views

urlpatterns = [
    # url(r'^matches/(?P<id>[0-9a-f-]+)$', views.MatchView.as_view()),
    url(r'^matches/(?P<id>[0-9a-f-]+)/?', include([
        url(r'^$', views.MatchView.as_view()),
        url(r'^telemetry$', views.TelemetryView.as_view()),
    ])),
    url(r'^players/(?P<shard>[\w-]+)/', include([
        url(r'^(?P<id>account\.[0-9a-f]+)$', views.PlayerView.as_view()),
        url(r'^(?P<name>.+)$', views.PlayerView.as_view()),
    ])),
]
