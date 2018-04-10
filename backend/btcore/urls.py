from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^matches/(?P<match_id>.+)$', views.Match.as_view()),
]
