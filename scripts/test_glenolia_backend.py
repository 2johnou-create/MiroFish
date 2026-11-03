"""Real Flask local request tests; network connections are blocked throughout."""
import importlib.util
import socket
import unittest
from pathlib import Path
from unittest.mock import patch


class LocalBoundaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.network_guard = patch.object(socket.socket, 'connect', side_effect=AssertionError('External network forbidden in local tests'))
        cls.network_guard.start()
        spec = importlib.util.spec_from_file_location('glenolia_backend', Path(__file__).with_name('glenolia-backend.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        cls.app = module.local_app()
        cls.app.testing = True
        cls.client = cls.app.test_client()

    @classmethod
    def tearDownClass(cls):
        cls.network_guard.stop()

    def test_health_is_a_real_local_response_not_a_simulation(self):
        response = self.client.get('/health', base_url='http://127.0.0.1:5501')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['status'], 'ok')
        self.assertFalse(self.app.debug)

    def test_remote_browser_origin_is_rejected_before_api_action(self):
        response = self.client.post('/api/graph/ontology/generate', base_url='http://127.0.0.1:5501', headers={'Origin': 'https://unrelated.example'}, json={})
        self.assertEqual(response.status_code, 403)
        self.assertNotIn('Access-Control-Allow-Origin', response.headers)

    def test_rebound_host_is_rejected(self):
        response = self.client.get('/health', base_url='http://rebound.example:5501')
        self.assertEqual(response.status_code, 403)

    def test_allowed_frontend_origin_and_nosniff(self):
        response = self.client.get('/health', base_url='http://127.0.0.1:3300', headers={'Origin': 'http://127.0.0.1:3300'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['X-Content-Type-Options'], 'nosniff')


if __name__ == '__main__':
    unittest.main()
