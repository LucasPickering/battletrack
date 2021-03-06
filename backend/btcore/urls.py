from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'shards', views.shards),
    url(r'^matches/', include([
        url(r'^recent$', views.RecentMatchesView.as_view()),
        url(r'^(?P<id>[0-9a-f-]+)$', views.MatchView.as_view()),
    ])),
    url(r'^players/(?P<shard>[\w-]+)/', include([
        url(r'^(?P<id>account\.[0-9a-f]+)$', views.PlayerView.as_view()),
        url(r'^(?P<name>.+)$', views.PlayerView.as_view()),
    ])),
]
