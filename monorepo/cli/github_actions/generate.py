import os 
from templates import HEADER_TEMPLATE, RELEASE_TEMPLATE, JOB_TEMPLATE, DEPLOY_TEMPLATE
from utils import build_order, dependencies, deployments, deployment_dependencies


file = ""
file += HEADER_TEMPLATE

file += RELEASE_TEMPLATE

for package in build_order:
	file += JOB_TEMPLATE(package, dependencies[package])

for deployment in deployments:
	file += DEPLOY_TEMPLATE(deployment, deployment_dependencies[deployment])

with open(".github/workflows/main_prod.yaml", "w") as f:
	f.write(file.replace("\t", "  "))