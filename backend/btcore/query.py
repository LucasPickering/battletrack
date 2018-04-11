from django.db import models


class DevAPIQuerySet(models.QuerySet):
    def get(self, *args, **kwargs):
        try:
            return super().get(*args, **kwargs)
        except self.model.DoesNotExist:
            try:
                data = self.model.api_getter(*args, **kwargs)
                return self.model.deser_dev_api(data)
            except Exception as e:
                print(repr(e))
                raise e


class DevAPIManager(models.Manager):
    def get_queryset(self):
        return DevAPIQuerySet(self.model)
