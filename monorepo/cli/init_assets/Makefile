CLI=docker run --rm -it -v $(PWD):/app -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/shaneburkhart/cli

test:
	rm -rf __test__ && mkdir __test__ && cd __test__ && bash ../paste.sh
	python3 assert_init.py || true
	rm -rf __test__

doctor:
	docker run --rm -it -v $(PWD):/app ghcr.io/shaneburkhart/cli

build:
	docker build -t ghcr.io/shaneburkhart/cli ./packages/cli
	$(CLI) python3 /cli/build.py

github_actions:
	$(CLI) python3 /cli/github_actions/generate.py

sys:
	bash install_system.sh
