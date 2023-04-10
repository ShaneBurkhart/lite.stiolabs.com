import uuid
import os

# generate unique filename
filename = str(uuid.uuid4()) + '.txt'

# create file
def create_todo_file():
    with open(filename, 'w') as f:
        f.write('Hello, world!')

# open file in VS Code
os.system('code ' + filename)