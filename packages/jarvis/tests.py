
import unittest
import lambda_function

class TestLambdaFunction(unittest.TestCase):
    def test_lambda_handler(self):
        event = {
            'key1': 'value1',
            'key2': 'value2',
            'key3': 'value3'
        }
        context = {}
        response = lambda_function.lambda_handler(event, context)
        self.assertEqual(response['statusCode'], 200)
        self.assertEqual(response['body'], '"Hello from Lambda!"')

if __name__ == '__main__':
    unittest.main()
