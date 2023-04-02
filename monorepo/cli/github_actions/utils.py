import os

dockerfiles = {}

############## DEPENDENCIES ##############
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
build_order = [k for k, v in sorted(required_counts.items(), key=lambda item: "{:03.0f}_{}".format(item[1], item[0]), reverse=True)]
print("build_order", build_order)
#####################################################

################ DEPLOYMENTS ########################
# get every pacakge in ./deployments
deployments = sorted([f.name for f in os.scandir("deployments") if f.is_dir()])
print("deployments", deployments)

deployment_dependencies = {}
for deployment in deployments:
	# check if DEPENDENCIES exists
	if not os.path.exists("deployments/{}/DEPENDENCIES".format(deployment)):
		raise Exception("deployments/{}/DEPENDENCIES does not exist".format(deployment))

	deployment_dependencies[deployment] = []
	with open("deployments/{}/DEPENDENCIES".format(deployment), "r") as f:
		deployment_dependencies[deployment] = f.read().splitlines()

	# check if deploy.sh exists
	if not os.path.exists("deployments/{}/deploy.py".format(deployment)):
		raise Exception("deployments/{}/deploy.py does not exist".format(deployment))
#####################################################

dockerfiles = {}

for package in build_order:
	if os.path.exists("packages/{}/Dockerfile.prod".format(package)):
		dockerfiles[package] = "Dockerfile.prod"
	else:
		dockerfiles[package] = "Dockerfile"
