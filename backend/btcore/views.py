import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def player(request, endpoint):
    print(endpoint)

    return Response()
