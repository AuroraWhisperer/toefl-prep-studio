"""Console logging shared by the local server launchers."""

from copy import deepcopy
import logging

from uvicorn.config import LOGGING_CONFIG


class StaticAccessFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not isinstance(record.args, tuple) or len(record.args) != 5:
            return True
        _, method, path, _, status = record.args
        is_asset = path.split('?', 1)[0].startswith(('/frontend/', '/audio/'))
        return not (method in {'GET', 'HEAD'} and is_asset and 200 <= status < 400)


def server_log_config() -> dict:
    config = deepcopy(LOGGING_CONFIG)
    for formatter in config['formatters'].values():
        formatter['fmt'] = '%(asctime)s ' + formatter['fmt']
        formatter['datefmt'] = '%Y-%m-%d %H:%M:%S'
    config['filters'] = {'static_access': {'()': StaticAccessFilter}}
    config['loggers']['uvicorn.access']['filters'] = ['static_access']
    config['loggers']['toefl_trainer'] = {
        'handlers': ['default'],
        'level': 'INFO',
        'propagate': False,
    }
    return config
