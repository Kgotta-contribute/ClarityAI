
#!/bin/bash
set -e

python ./main.py &
python ./run_api.py &

wait -n
