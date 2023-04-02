import os

commands = [
	"npm install prisma --save-dev",
	"npx prisma init" 
]

for command in commands:
	os.system(command)