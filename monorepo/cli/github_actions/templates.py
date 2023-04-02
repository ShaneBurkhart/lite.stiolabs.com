from utils import dockerfiles


HEADER_TEMPLATE = """
name: PRODUCTION - Web, Lambda, OTA

on:
  release:
    types: [created]

concurrency: 
  group: production


jobs:
"""

RELEASE_TEMPLATE = """
  tag-release:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Check for build config
      run: |
        make github_actions
        if [ $(git status --porcelain | wc -l) -eq "0" ]; then
          echo "  🟢 Git repo is clean."
        else
          echo "  🔴 Git repo dirty. Quit."
          git status 
          git --no-pager diff
          exit 1
        fi

    - name: version
      id: version
      run: |
        git fetch --prune --unshallow

        # get the latest tag
        echo $(git tag -l | sort -n)
        latest_tag=$(git tag -l | sort -n | tail -n 1 || echo 1)
        echo $latest_tag

        # increment the version number
        version_number=$((latest_tag + 1))
        echo $version_number

        echo "::set-output name=version::$version_number"

    - name: release
      uses: actions/create-release@v1
      id: create_release
      with:
        draft: false
        prerelease: false
        release_name: ${{ steps.version.outputs.version }}
        tag_name: ${{ steps.version.outputs.version }}
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
"""

def JOB_TEMPLATE(package, dependencies):
	dependencies = ["tag-release"] + dependencies
	needs = """needs: {}""".format(dependencies)

	build = "; ".join([
		' '.join([
			"docker build",
				"-t ghcr.io/shaneburkhart/${{package}}",
				"-f packages/${{package}}/{}",
				"--cache-from ghcr.io/shaneburkhart/${{package}}",
				"--build-arg BUILDKIT_INLINE_CACHE=1",
				"packages/${{package}}",
		]).format(dockerfiles[package]),
		'docker push ghcr.io/shaneburkhart/${package}:latest'
	])

	return """
		{}:
			runs-on: ubuntu-latest
			{}

			env:
				package: {}
				REGISTRY: ghcr.io

			steps:
			- name: Checkout code
				uses: actions/checkout@v2
			
			- name: Log in to the Container registry
        uses: docker/login-action@f054a8b539a109f9f41c372932f1ae047eff08c9
        with:
          registry: ${{{{ env.REGISTRY }}}}
          username: ${{{{ github.actor }}}}
          password: ${{{{ secrets.PACKAGE_TOKEN }}}}

			- name: Build
				run: |
					{}

          export DOCKER_BUILDKIT=1
					{}
	""".format(package, needs, package, "package='${{ env.package }}'", build)


def DEPLOY_TEMPLATE(deployment, dependencies):
	needs = ""
	if len(dependencies) > 0:
		needs = """needs: {}""".format(dependencies)

	return """
		{}_deployment:
			name: Deploy {}
			runs-on: ubuntu-latest
			{}

			env:
				deployment: {}
				REGISTRY: ghcr.io

			steps:
			- name: Checkout code
				uses: actions/checkout@v2

			- name: Log in to the Container registry
        uses: docker/login-action@f054a8b539a109f9f41c372932f1ae047eff08c9
        with:
          registry: ${{{{ env.REGISTRY }}}}
          username: ${{{{ github.actor }}}}
          password: ${{{{ secrets.PACKAGE_TOKEN }}}}
			
			- name: Deploy
				run: |
					# export EXPO_TOKEN=${{{{ secrets.EXPO_TOKEN }}}}

					export AWS_ACCESS_KEY_ID=${{{{ secrets.AWS_ACCESS_KEY_ID }}}}
					export AWS_SECRET_ACCESS_KEY=${{{{ secrets.AWS_SECRET_ACCESS_KEY }}}}
					export AWS_REGION=us-east-1
					export LAMBDA_AWS_EXECUTION_ROLE=arn:aws:iam::275146336726:role/STIO_LAMBDA_EXEC

					python3 ./deployments/${{{{env.deployment}}}}/deploy.py
	""".format(deployment, deployment, needs, deployment, "deployment='${{ env.deployment }}'")
