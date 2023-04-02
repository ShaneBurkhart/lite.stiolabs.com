import os

print("")

## SETUP
print("🛠️  Setting up test environment")
os.system("rm -rf __test__ && mkdir __test__")
os.system("cd __test__ && docker run -v $(pwd):/app -v $(pwd)/../packages/cli:/cli -it ghcr.io/shaneburkhart/cli")

print("")

failed = False

try:
    # make sure __test__ is a directory
    assert os.path.isdir("__test__"), "❌ __test__ is not a directory"
    # make sure it contains deployments/
    assert os.path.isdir("__test__/deployments"), "❌ deployments/ directory not found"
    # make sure it contains packages/
    assert os.path.isdir("__test__/packages"), "❌ packages/ directory not found"
    # make sure it contains Makefile
    assert os.path.isfile("__test__/Makefile"), "❌ Makefile not found"
    # make sure it contains .gitignore
    assert os.path.isfile("__test__/.gitignore"), "❌ .gitignore not found"
    # make sure it contains install_system.sh
    assert os.path.isfile("__test__/install_system.sh"), "❌ install_system.sh not found"


    # INSTALL
    print("🛠️  Installing system", end="\n\n")
    code = os.system("cd __test__ && install_system.sh")
    print("")

    assert code == 0, "❌ install_system.sh failed"
    # make sure install_system.sh is gone
    assert not os.path.isfile("__test__/install_system.sh"), "❌ install_system.sh not removed"

except AssertionError as e:
    print(f"AssertionError: \n{e}")
    failed = True


## CLEANUP
os.system("rm -rf __test__")


if failed:
    print("")
    print("❌ Tests failed", end="\n\n")
    exit(1)
else:
    print("✅ All tests passed", end="\n\n")
