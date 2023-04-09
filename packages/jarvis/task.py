import os
import subprocess
from todo import generate_unique_filename

def main():
    # Generate a new todo file
    todo_file = generate_unique_filename()

    # Open the file in VS Code
    subprocess.run(['code', todo_file])

if __name__ == '__main__':
    main()
