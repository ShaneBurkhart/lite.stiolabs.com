import os 

# get every pacakge in ./packages
packages = [f.name for f in os.scandir("packages") if f.is_dir()]
# find each packages DEPENDENCIES
dependencies = {}
for package in packages:
	# check if DEPENDENCIES exists
	if not os.path.exists("packages/{}/DEPENDENCIES".format(package)):
		raise Exception("packages/{}/DEPENDENCIES does not exist".format(package))

	dependencies[package] = []
	with open("packages/{}/DEPENDENCIES".format(package), "r") as f:
		dependencies[package] = f.read().splitlines()

required_counts = {}

def add_required_counts(package, deps):
	if package not in required_counts:
		required_counts[package] = 0

	for dep in deps:
		if dep not in required_counts:
			required_counts[dep] = 0
		required_counts[dep] += 1

		add_required_counts(dep, dependencies[dep])

for package, deps in dependencies.items():
	add_required_counts(package, deps)

# create an array of required_counts keys sorted by value, invert
build_order = [k for k, v in sorted(required_counts.items(), key=lambda item: item[1], reverse=True)]

try:
	for package in build_order:
		# check if call fails and raise exception
		code = os.system("docker build -t shaneburkhart/{} packages/{}".format(package, package))
		if code != 0:
			raise Exception("Failed to build image for {}".format(package))

		code = os.system("docker tag shaneburkhart/{} ghcr.io/shaneburkhart/{}:latest".format(package, package))
		if code != 0:
			raise Exception("Failed to tag image for {}".format(package))
except Exception as e:
	print(e)
	exit(1)