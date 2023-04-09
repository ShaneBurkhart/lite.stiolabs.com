import subprocess
import os
import openai 
from termcolor import colored
from util import get_cwd_structure, format_cwd_structure, generate_response, generate_response_prompt, generate_response_smart

openai.api_key = os.environ.get("OPENAI_KEY")

filesSys = """
You are Software Engineer GPT.
These are the commands you can use:
- READ <path>
	- reads the file at the path and adds it to the context

====== OUTPUT FORMAT (IMPORTANT!)
READ <path>
"""
def filesPrompt(task):
	dirs = format_cwd_structure(get_cwd_structure())

	return """
	====== DIRECTORY STRUCTURE
	pwd = /app

	{dirs}

	====== TASK
	{task}

	====== PROMPT
	Using the commands above, which files do you need access to to complete this task?

	====== OUTPUT FORMAT
	READ <path>
	""".format(dirs=dirs, task=task)

doSys = """
You are Software Engineer GPT.
"""

def doPrompt(task, contents):
	dirs = format_cwd_structure(get_cwd_structure())

	return """
	====== DIRECTORY STRUCTURE
	pwd = /app

	{dirs}

	====== FILES
	{contents}

	====== TASK
	{task}

	====== PROMPT
	Create a python script called task.py. This script will update the files in the codebase to complete the task.
	""".format(dirs=dirs, task=task, contents=contents)

	# ====== OUTPUT FORMAT (IMPORTANT!)
	# import os
	# print('hello')



SPEC = "Modify the file todo.py to open the newly generated file in vs code"

messages = [
	{ "role": "system", "content": filesSys },
	{ "role": "user", "content": filesPrompt(SPEC) },
]

# print(messages)

print(colored("========== USER SPEC ===========", "yellow"))
print(SPEC)
print(colored("================================\n", "yellow"))

print(colored("BUILDING CONTEXT", "green"))
res = generate_response(messages)
print(res)

contents = []
reads = res.split("\n")
# print(reads)
for read in reads:
	print(colored("READING", "blue"), read)
	cmd = read.split(" ")[0]

	if cmd != "READ":
		raise Exception("Invalid command")

	path = read.split(" ")[1]
	with open(path, "r") as f:
		content = f.read()
		s = path + "\n" + content
		contents.append(s)

messages = [
	{ "role": "system", "content": doSys },
	{ "role": "user", "content": doPrompt(SPEC, "\n".join(contents)) },
]
genPrompt = doSys + "\n\n" + doPrompt(SPEC, "\n".join(contents))

print(colored("GENERATING PYTHON EXEC SCRIPT", "green"))
res = generate_response(messages)
print(res)

res2 = res.split("```")[1]
# remove first line
res2 = "\n".join(res2.split("\n")[1:])

print(colored("SAVING PYTHON EXEC SCRIPT", "green"))

# # save the file
with open("task.py", "w") as f:
	f.write(res2)

print(colored("RUNNING PYTHON EXEC SCRIPT", "green"))

completed_process = subprocess.run("python task.py", capture_output=True, shell=True)

error_message = True
while error_message:
	error_message = False

	if completed_process.returncode == 0:
		# The command executed successfully
		logs = completed_process.stdout.decode()
		print(colored("DONE", "green"), logs)
	else:
		# The command failed
		error_message = completed_process.stderr.decode()
		print(colored("ERROR", "red"), error_message)

		# try a debug step
		c = error_message + "\n\n" + "Fix this error. Give full rewrites."
		messages.append({ "role": "user", "content": c })

		print(colored("DEBUGGING", "green"))
		res = generate_response(messages)
		print(res)

		# error_message = True


raise Exception("stop")


print("Hello World")
# text = generate_response("Hello World")
# print(text)

env = "python"
dirs = format_cwd_structure(get_cwd_structure())
sys = "\n\n".join([
	"You are WozniakGPT.",
	"This is your environment:",
	env,
	"Current Directory Structure:",
	"/app\n"+dirs,
])

prompt = "\n\n".join([
	"This is the spec from the user:",
	spec,
	"==============================",
	"Create a list of paths of files you want to read."
	# "Define the steps to complete this task."
	# "Create a Python script that will complete the task exactly as the user defines. Output only the code." 
])

messages = [
	{ "role": "system", "content": sys },
	{ "role": "user", "content": prompt },
]

res = generate_response(messages)
print(res)

raise Exception("stop")

# save the file
with open("todo.txt", "w") as f:
	f.write(res)

# with open("todo.py", "w") as f:
# 	res = res.split("```")[1]
# 	# remove first line
# 	res = "\n".join(res.split("\n")[1:])
# 	f.write(res)


# raise Exception("stop")

gen = "Create a task.py to complete the above steps."
messages = [
	{ "role": "system", "content": sys },
	# { "role": "user", "content": prompt },
	{ "role": "assistant", "content": res },
	{ "role": "user", "content": gen },
]

res2 = generate_response(messages)
print(res2)

res2 = res2.split("```")[1]
# remove first line
res2 = "\n".join(res2.split("\n")[1:])

# save the file
with open("task.py", "w") as f:
	f.write(res2)

# run the file and capture the output

completed_process = subprocess.run("python task.py", capture_output=True, shell=True)

if completed_process.returncode == 0:
	# The command executed successfully
	logs = completed_process.stdout.decode()
	print("DONE", logs)
else:
	# The command failed
	error_message = completed_process.stderr.decode()
	print("ERROR", error_message)


	messages = [
		{ "role": "system", "content": sys },
		{ "role": "user", "content": prompt },
		{ "role": "assistant", "content": res },
		{ "role": "user", "content": gen },
		{ "role": "assistant", "content": res2 },
		{ "role": "user", "content": error_message },
	]

	# res3 = generate_response(messages)
	# print(res3)
