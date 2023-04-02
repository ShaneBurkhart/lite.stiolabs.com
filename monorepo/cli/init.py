import os

# check if the directory current is empty
if os.listdir(os.getcwd()):
	print("Directory is not empty!")
	exit(1)

# create the directory structure
os.mkdir("deployments")
os.mkdir("packages")

# copy files
os.system("cp /cli/init_assets/Makefile .")
os.system("cp /cli/init_assets/.gitignore .")
os.system("cp /cli/init_assets/install_system.sh .")

