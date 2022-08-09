from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in kitchen/__init__.py
from kitchen import __version__ as version

setup(
	name="kitchen",
	version=version,
	description="Kitchen",
	author="Saranesh",
	author_email="test@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
