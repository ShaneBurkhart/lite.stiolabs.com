def generate_response(messages):
	response = openai.ChatCompletion.create(
		model="gpt-3.5-turbo",
		messages=