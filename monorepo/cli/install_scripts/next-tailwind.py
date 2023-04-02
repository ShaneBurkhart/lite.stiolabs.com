import os

globalStyles = """
@tailwind base;
@tailwind components;
@tailwind utilities;
"""

tailwindConfig = """
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""

commands = [
	"npm install -D tailwindcss postcss autoprefixer",
	"npx tailwindcss init -p",
]

print("\n\n========= COPY AND PASTE THE FOLLOWING =========\n\n")
print("Add global styles to styles/globals.css")
print(globalStyles)

for command in commands:
	os.system(command)

# replace contents of tailwind.config.js
with open("tailwind.config.js", "w") as f:
  f.write(tailwindConfig)
