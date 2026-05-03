import threading

from django.conf import settings


class ConfigManager:
    """
    Singleton that loads Django settings once and caches the values.
    Thread-safe: a lock guards the first-time initialisation.

    Usage:
        cfg = ConfigManager()
        cfg.get('DEBUG')        # True / False
        cfg.get('DB_NAME')      # 'qanoon_assist'
        cfg.get('JWT_ACCESS_MINUTES')  # 60

    Test isolation:
        ConfigManager.reset()  # drops the singleton so next call rebuilds it
    """

    _instance = None
    _lock = threading.Lock()

    # Keys exposed via get()
    _KEYS = frozenset([
        'DEBUG',
        'ALLOWED_HOSTS',
        'DB_NAME',
        'JWT_ACCESS_MINUTES',
        'JWT_REFRESH_DAYS',
    ])

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:  # double-checked locking
                    instance = super().__new__(cls)
                    instance._cache = cls._load()
                    cls._instance = instance
        return cls._instance

    @staticmethod
    def _load() -> dict:
        db_cfg = settings.DATABASES.get('default', {})
        jwt_cfg = getattr(settings, 'SIMPLE_JWT', {})

        access_td = jwt_cfg.get('ACCESS_TOKEN_LIFETIME')
        refresh_td = jwt_cfg.get('REFRESH_TOKEN_LIFETIME')

        return {
            'DEBUG': settings.DEBUG,
            'ALLOWED_HOSTS': list(settings.ALLOWED_HOSTS),
            'DB_NAME': db_cfg.get('NAME', ''),
            'JWT_ACCESS_MINUTES': int(access_td.total_seconds() // 60) if access_td else None,
            'JWT_REFRESH_DAYS': int(refresh_td.days) if refresh_td else None,
        }

    def get(self, key: str):
        """Return the cached value for `key`, or raise KeyError if unknown."""
        if key not in self._KEYS:
            raise KeyError(f"Unknown config key '{key}'. Known keys: {sorted(self._KEYS)}")
        return self._cache[key]

    @classmethod
    def reset(cls):
        """Drop the singleton instance. For test isolation only."""
        with cls._lock:
            cls._instance = None
