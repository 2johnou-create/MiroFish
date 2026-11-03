"""Run the existing app on loopback only, without inheriting a parent .env file."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_ENV = ROOT / 'private.env'
os.environ['MIROFISH_ENV_FILE'] = str(PRIVATE_ENV)
os.environ['FLASK_HOST'] = '127.0.0.1'
os.environ['FLASK_PORT'] = '5501'
os.environ['FLASK_DEBUG'] = 'False'
sys.path.insert(0, str(ROOT / 'backend'))

from app.config import Config
from app import create_app
from flask import request

ORIGIN = 'http://127.0.0.1:3300'


class LocalConfig(Config):
    DEBUG = False
    CORS_ORIGINS = [ORIGIN]


def local_app():
    app = create_app(LocalConfig)

    @app.before_request
    def local_request_only():
        # Prevent a remote browser origin or a rebound hostname from operating
        # this unauthenticated research app, even though it binds to loopback.
        if request.host not in {'127.0.0.1:3300', '127.0.0.1:5501'}:
            return {'error': 'Use the Glenolia loopback address.'}, 403
        origin = request.headers.get('Origin')
        if origin and origin != ORIGIN:
            return {'error': 'This local profile accepts its own browser origin only.'}, 403

    @app.after_request
    def local_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Content-Security-Policy'] = "frame-ancestors 'none'"
        return response

    return app


def main():
    errors = LocalConfig.validate()
    if errors:
        print('MiroFish needs a configured LLM account/model and Zep Cloud key. Run the local preflight; no provider call was made.')
        return 2
    app = local_app()
    app.run(host='127.0.0.1', port=5501, debug=False, use_reloader=False, threaded=True)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
