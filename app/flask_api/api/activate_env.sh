#!/bin/bash
conda activate flask_env && gunicorn -b 127.0.0.1:5000 __init__:app
