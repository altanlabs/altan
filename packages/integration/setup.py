from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="altan",
    version="0.1.0",
    author="Altan Team",
    author_email="support@altan.io",
    description="Python client for the Altan Actions API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/altan/altan-python",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=[
        "requests>=2.25.0",
    ],
    extras_require={
        "async": ["httpx>=0.22.0"],
        "dev": [
            "pytest>=6.0.0",
            "pytest-cov>=2.12.0",
            "black>=21.5b2",
            "isort>=5.9.1",
            "mypy>=0.812",
            "flake8>=3.9.2",
            "httpx>=0.22.0",
        ],
    }
) 