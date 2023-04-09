import subprocess
import os
import openai 

openai.api_key = os.environ.get("OPENAI_KEY")

def generate_response_smart(prompt):
	response = openai.Completion.create(
		model="",
		prompt=prompt,
		temperature=0
	)

	# print(response)
	return response.choices[0].text.strip()

def generate_response(messages):
	response = openai.ChatCompletion.create(
		model="gpt-3.5-turbo",
		messages=messages,
		temperature=0
	)

	# print(response)
	return response.choices[0].message.content.strip()

def generate_response_prompt(system, prompt):
	return generate_response([
		{"role": "system", "content": system },
		{"role": "user", "content": prompt },
		# {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
		# {"role": "user", "content": "Where was it played?"}
	])

def get_cwd_structure(path=None):
	"""
	Returns the current working directory's structure recursively as a dictionary.
	"""
	cwd = os.getcwd()
	if path:
		cwd = path
	result = {}

	for item in os.listdir(cwd):
		path = os.path.join(cwd, item)
		if os.path.isdir(path):
			result[item] = get_cwd_structure(path)
		else:
			result[item] = None

	return result

def format_cwd_structure(structure, indent=0):
	"""
	Formats a directory structure dictionary as a tab-indented text string.
	"""
	output = ""
	for key, value in structure.items():
		output += "\t" * indent + f"- {key}\n"
		if isinstance(value, dict):
			output += format_cwd_structure(value, indent + 1)
	return output

