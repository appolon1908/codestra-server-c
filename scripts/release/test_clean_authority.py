import unittest
from unittest.mock import patch
import verify_intent


class CleanAuthorityTests(unittest.TestCase):
    def test_dirty_checkout_rejected_before_api_or_publication(self):
        for status in [' M tracked.py', 'M  staged.py', '?? extra.py']:
            with self.subTest(status=status), patch.object(verify_intent, 'command', return_value=status), patch.object(verify_intent, 'api') as api:
                with self.assertRaisesRegex(ValueError, 'Dirty authority checkout'):
                    verify_intent.main()
                api.assert_not_called()
