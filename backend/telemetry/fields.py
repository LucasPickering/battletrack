from django.core.exceptions import ValidationError
from django.db import models
from rest_framework import serializers

from btcore.util import PLAYER_ID_LENGTH


_FLOAT_MAX_LENGTH = 20  # Max character length of a float number


class Position:
    MAX_LENGTH = _FLOAT_MAX_LENGTH * 3 + 2

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    @classmethod
    def from_string(cls, s):
        return cls(*(float(f) for f in s.split(',')))

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    def to_dict(self):
        return {'x': self.x, 'y': self.y, 'z': self.z}

    def to_db_string(self):
        return ','.join(str(e) for e in [self.x, self.y, self.z])

    def __str__(self):
        return f"({self.x}, {self.y}, {self.z})"

    def __eq__(self, other):
        return isinstance(other, Position) \
            and self.x == other.x and self.y == other.y and self.z == other.z


class Circle:
    MAX_LENGTH = _FLOAT_MAX_LENGTH + Position.MAX_LENGTH + 1

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
        return ','.join([str(self.radius), self.pos.to_db_string()])

    def to_dict(self):
        return {'radius': self.radius, 'pos': self.pos.to_dict()}

    def __str__(self):
        return f"({self.radius}, {self.pos})"

    def __eq__(self, other):
        return isinstance(other, Circle) and self.radius == other.radius and self.pos == other.pos


class EventPlayer:
    MAX_LENGTH = PLAYER_ID_LENGTH + 20 + _FLOAT_MAX_LENGTH + Position.MAX_LENGTH + 3

    def __init__(self, id, name, health, pos):
        self.id = id
        self.name = name
        self.health = health
        self.pos = pos

    @classmethod
    def from_string(cls, s):
        id, name, health, pos = s.split(',', 3)  # Max 3 splits
        return cls(id, name, float(health), Position.from_string(pos))

    @classmethod
    def from_dict(cls, d):
        return cls(d['id'], d['name'], d['health'], Position.from_dict(d['pos']))

    @staticmethod
    def convert_dev_data(dev_data):
        id_ = dev_data['accountId']
        if id_:
            return {
                'id': id_,
                'name': dev_data['name'],
                'health': dev_data['health'],
                'pos': dev_data['location'],
            }
        return None

    def to_db_string(self):
        return ','.join([self.id, self.name, str(self.health), self.pos.to_db_string()])

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'health': self.health, 'pos': self.pos.to_dict()}

    def __str__(self):
        return f"{self.name} ({self.id})"


class Item:
    MAX_LENGTH = 100

    def __init__(self, name, stack_count, category, subcategory):
        self.name = name
        self.stack_count = stack_count
        self.category = category
        self.subcategory = subcategory

    @classmethod
    def from_string(cls, s):
        name, stack_count, category, subcategory = s.split(',')
        return cls(name, int(stack_count), category, subcategory)

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

    def to_db_string(self):
        return ','.join([self.name, str(self.stack_count), self.category, self.subcategory])

    def to_dict(self):
        return {'name': self.name, 'stack_count': self.stack_count,
                'category': self.category, 'subcategory': self.subcategory}

    def __str__(self):
        return f"{self.name} x {self.stack_count}"


class Vehicle:
    MAX_LENGTH = 100

    def __init__(self, type, name, health, fuel):
        self.type = type
        self.name = name
        self.health = health
        self.fuel = fuel

    @classmethod
    def from_string(cls, s):
        type, name, health, fuel = s.split(',')
        return cls(type, name, float(health), float(fuel))

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    @staticmethod
    def convert_dev_data(dev_data):
        type_ = dev_data['vehicleType']
        if type_:
            return {
                'type': type_,
                'name': dev_data['vehicleId'],
                'health': dev_data['healthPercent'],
                'fuel': dev_data['feulPercent'],  # Yes, it's spelled wrong in the API data...
            }
        return None

    def to_db_string(self):
        return ','.join([self.type, self.name, str(self.health), str(self.fuel)])

    def to_dict(self):
        return {'type': self.type, 'name': self.name, 'health': self.health, 'fuel': self.fuel}

    def __str__(self):
        return f"{self.name} (health={self.health},fuel={self.fuel})"


class EventField(models.CharField):
    def __init__(self, data_cls, *args, **kwargs):
        self._data_cls = data_cls
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if not value:
            return None
        return self._data_cls.from_string(value)

    def to_python(self, value):
        if not value or isinstance(value, self._data_cls):
            return value
        return self._data_cls.from_string(value)

    def get_prep_value(self, value):
        if value is None:
            return ''
        if isinstance(value, self._data_cls):
            data = value
        elif isinstance(value, dict):
            data = self._data_cls.from_dict(value)
        else:
            raise ValidationError(f"Unknown type {type(value)} for: {value}")
        return data.to_db_string()


class PositionField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Position, max_length=Position.MAX_LENGTH)


class CircleField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Circle, max_length=Circle.MAX_LENGTH)


class EventPlayerField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(EventPlayer, max_length=EventPlayer.MAX_LENGTH)


class ItemField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Item, max_length=Item.MAX_LENGTH)


class VehicleField(EventField):
    def __init__(self, *args, **kwargs):
        super().__init__(Vehicle, max_length=Vehicle.MAX_LENGTH)


class EventSerializerField(serializers.Field):
    def to_representation(self, obj):
        return obj.to_dict()  # Object class -> dict
