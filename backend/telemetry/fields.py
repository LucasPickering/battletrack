import json
from django.core.exceptions import ValidationError
from django.db import models
from rest_framework import serializers


def convert_distance(dist):
    """
    @brief      Converts the given distance from the API's weird units to meters.

    @param      dist  The distance, in PUBG stupid units

    @return     the distance, in meters
    """
    return dist / 101.171242  # Calculated from circle widths, calibrated by comparing to replay


class Position2:
    def __init__(self, x, y, z=None):  # Allow z for compatibility
        self.x = x
        self.y = y

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    @staticmethod
    def convert_dev_data(dev_data):
        return {k: convert_distance(v) for k, v in dev_data.items()}

    def to_dict(self):
        return {'x': self.x, 'y': self.y}

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __eq__(self, other):
        return isinstance(other, Position2) \
            and self.x == other.x and self.y == other.y


class Position3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    @staticmethod
    def convert_dev_data(dev_data):
        return {k: convert_distance(v) for k, v in dev_data.items()}

    def to_dict(self):
        return {'x': self.x, 'y': self.y, 'z': self.z}

    def __str__(self):
        return f"({self.x}, {self.y}, {self.z})"

    def __eq__(self, other):
        return isinstance(other, Position3) \
            and self.x == other.x and self.y == other.y and self.z == other.z


class Ray:  # Fuckin' way she goes
    def __init__(self, start, end):
        self.start = start
        self.end = end

    @classmethod
    def from_dict(cls, d):
        return cls(Position2(**d['start']), Position2(**d['end']))

    def to_dict(self):
        return {'start': self.start.to_dict(), 'end': self.end.to_dict()}

    def __str__(self):
        return f"({self.start}, {self.end})"

    def __eq__(self, other):
        return isinstance(other, Ray) and self.start == other.start and self.end == other.end


class Circle:
    def __init__(self, radius, pos):
        self.radius = radius
        self.pos = pos

    @classmethod
    def from_dict(cls, d):
        return cls(d['radius'], Position2(**d['pos']))

    @staticmethod
    def convert_dev_data(radius, pos):
        if radius > 0:
            return {'radius': convert_distance(radius), 'pos': Position2.convert_dev_data(pos)}
        return None

    def to_dict(self):
        return {'radius': self.radius, 'pos': self.pos.to_dict()}

    def __str__(self):
        return f"({self.radius}, {self.pos})"

    def __eq__(self, other):
        return isinstance(other, Circle) and self.radius == other.radius and self.pos == other.pos


class EventPlayer:
    def __init__(self, id, name, health, pos):
        self.id = id
        self.name = name
        self.health = health
        self.pos = pos

    @classmethod
    def from_dict(cls, d):
        return cls(d['id'], d['name'], d['health'], Position3.from_dict(d['pos']))

    @staticmethod
    def convert_dev_data(dev_data):
        if dev_data:
            id_ = dev_data['accountId']
            if id_:
                return {
                    'id': id_,
                    'name': dev_data['name'],
                    'health': dev_data['health'],
                    'pos': Position3.convert_dev_data(dev_data['location']),
                }
        return None

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'health': self.health, 'pos': self.pos.to_dict()}

    def __str__(self):
        return f"{self.name} ({self.id})"


class Item:
    def __init__(self, name, stack_count, category, subcategory):
        self.name = name
        self.stack_count = stack_count
        self.category = category
        self.subcategory = subcategory

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    @staticmethod
    def convert_dev_data(dev_data):
        name = dev_data['itemId']
        if name:
            return {
                'name': name,
                'stack_count': dev_data['stackCount'],
                'category': dev_data['category'],
                'subcategory': dev_data['subCategory'],
            }
        return None

    def to_dict(self):
        return {'name': self.name, 'stack_count': self.stack_count,
                'category': self.category, 'subcategory': self.subcategory}

    def __str__(self):
        return f"{self.name} x {self.stack_count}"


class Vehicle:
    def __init__(self, type, name, health, fuel):
        self.type = type
        self.name = name
        self.health = health
        self.fuel = fuel

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    @staticmethod
    def convert_dev_data(dev_data):
        if dev_data:
            type_ = dev_data['vehicleType']
            if type_:
                return {
                    'type': type_,
                    'name': dev_data['vehicleId'],
                    'health': dev_data['healthPercent'],
                    'fuel': dev_data['feulPercent'],  # Yes, it's spelled wrong in the API data...
                }
        return None

    def to_dict(self):
        return {'type': self.type, 'name': self.name, 'health': self.health, 'fuel': self.fuel}

    def __str__(self):
        return f"{self.name} (health={self.health},fuel={self.fuel})"


class EventField(models.TextField):
    def __init__(self, data_cls, *args, **kwargs):
        self._data_cls = data_cls
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if not value:
            return None
        return self._data_cls.from_dict(json.loads(value))  # Convert from JSON dict

    def get_prep_dict(self, value):
        if isinstance(value, self._data_cls):
            return value.to_dict()
        elif isinstance(value, dict):
            return value
        else:
            raise ValidationError(f"Unknown type {type(value)} for: {value}")

    def get_prep_value(self, value):
        if value is None:
            return ''
        return json.dumps(self.get_prep_dict(value))  # Convert to JSON dict


class EventListField(EventField):
    def from_db_value(self, value, expression, connection):
        if not value:
            return None
        parsed = json.loads(value)  # Parse JSON list
        return [self._data_cls.from_dict(d) if d else None for d in parsed]

    def get_prep_value(self, value):
        if value is None:
            return ''
        if isinstance(value, list):
            return json.dumps([self.get_prep_dict(e) for e in value])  # Convert to JSON list
        raise ValidationError(f"Unknown type {type(value)} for: {value}")


class Position2Field(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Position2, *args, **kwargs)


class Position3Field(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Position3, *args, **kwargs)


class CircleField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Circle, *args, **kwargs)


class RayField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Ray, *args, **kwargs)


class EventPlayerField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(EventPlayer, *args, **kwargs)


class ItemField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Item, *args, **kwargs)


class VehicleField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Vehicle, *args, **kwargs)


class CircleListField(EventListField):
    def __init__(self, *args, **kwargs):
        super().__init__(Circle, *args, **kwargs)


class ItemListField(EventListField):
    def __init__(self, *args, **kwargs):
        super().__init__(Item, *args, **kwargs)


class EventSerializerField(serializers.Field):
    def to_representation(self, obj):
        return obj.to_dict()  # Object class -> dict


class EventListSerializerField(serializers.ListField):
    def to_representation(self, obj):
        return [e.to_dict() for e in obj]  # List of object class -> list of dicts
