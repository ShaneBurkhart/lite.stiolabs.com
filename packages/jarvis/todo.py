import uuid
import os

TODO_DIR = 'todo'

def generate_unique_filename():
    unique_name = str(uuid.uuid4())
    return os.path.join(TODO_DIR, f'{unique_name}.txt')

def main():
    todo_file = generate_unique_filename()
    with open(todo_file, 'a'):
        os.utime(todo_file, None)
    print(f'To-do file created at {todo_file}')

if __name__ == '__main__':
    main()
