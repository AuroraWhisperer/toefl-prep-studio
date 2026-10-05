"""Console and file logging shared by the local server launchers."""

import logging
import sys
from copy import deepcopy
from logging.handlers import RotatingFileHandler
from pathlib import Path


class StaticAccessFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not isinstance(record.args, tuple) or len(record.args) != 5:
            return True
        _, method, path, _, status = record.args
        is_asset = path.split('?', 1)[0].startswith(('/frontend/', '/audio/'))
        return not (method in {'GET', 'HEAD'} and is_asset and 200 <= status < 400)


def rotating_file_handler(filename: str | Path) -> RotatingFileHandler:
    return RotatingFileHandler(filename, encoding='utf-8', maxBytes=2 * 1024 * 1024, backupCount=3)


def log_service_failure(log_file: Path) -> None:
    logger = logging.getLogger('toefl_trainer')
    # Reuse the server's open file; a second handle prevents rotation on Windows.
    if any(
        isinstance(handler, RotatingFileHandler) and handler.baseFilename == str(log_file.resolve())
        for handler in logger.handlers
    ):
        logger.exception('Local tray service failed')
        return

    log_file.parent.mkdir(parents=True, exist_ok=True)
    handler = rotating_file_handler(log_file)
    try:
        handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
        handler.handle(
            logger.makeRecord(
                logger.name,
                logging.ERROR,
                __file__,
                0,
                'Local tray service failed',
                (),
                sys.exc_info(),
            )
        )
    finally:
        handler.close()


def server_log_config(log_file: Path | None = None) -> dict:
    from uvicorn.config import LOGGING_CONFIG

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
    if log_file is not None:
        for formatter in config['formatters'].values():
            formatter['use_colors'] = False
        config['handlers'] = {
            'file': {
                '()': rotating_file_handler,
                'filename': str(log_file),
                'formatter': 'default',
            }
        }
        for logger in config['loggers'].values():
            if logger.get('handlers'):
                logger['handlers'] = ['file']
    return config
