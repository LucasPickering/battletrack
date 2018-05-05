from django.db import models
from rest_framework import serializers


class Position:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    @classmethod
    def from_string(cls, s):
        return cls(*(float(f) for f in s.split(',')))

    def to_dict(self):
        return {'x': self.x, 'y': self.y, 'z': self.z}

    def to_db_string(self):
        return f"{self.x},{self.y},{self.z}"

    def __str__(self):
        return f"({self.x}, {self.y}, {self.z})"


class Circle:
    def __init__(self, radius, pos):
        self.radius = radius
        self.pos = pos

    @classmethod
    def from_string(cls, s):
        radius, pos = s.split(',', 1)  # Split on the first comma
        return cls(float(radius), Position.from_string(pos))

    @classmethod
    def from_dict(cls, d):
        return cls(d['radius'], Position(**d['pos']))

    def to_db_string(self):
        return f"{self.radius},{self.pos.to_db_string()}"

    def to_dict(self):
        return {'radius': self.radius, 'pos': self.pos.to_dict()}

    def __str__(self):
        return f"({self.radius}, {self.pos})"


class PositionField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 64
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if not value:
            return None
        return Position.from_string(value)

    def to_python(self, value):
        if not value or isinstance(value, Position):
            return value
        return Position.from_string(value)

    def get_prep_value(self, value):
        if value is None:
            return ''
        if isinstance(value, Position):
            pos = value
        elif isinstance(value, dict):
            pos = Position(**value)
        else:
            raise models.ValidationError(f"Unknown type for {value}")
        return pos.to_db_string()


class CircleField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 85
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if not value:
            return None
        return Circle.from_string(value)

    def to_python(self, value):
        if not value or isinstance(value, Circle):
            return value
        return Circle.from_string(value)

    def get_prep_value(self, value):
        if value is None:
            return ''
        if isinstance(value, Circle):
            circle = value
        elif isinstance(value, dict):
            circle = Circle.from_dict(value)
        else:
            raise models.ValidationError(f"Unknown type for {value}")
        return circle.to_db_string()


class PositionSerializerField(serializers.Field):
    def to_representation(self, obj):
        return obj.to_dict()  # Position -> dict


class CircleSerializerField(serializers.Field):
    def to_representation(self, obj):
        return obj.to_dict()  # Circle -> dict
