
#!/bin/bash

 

# turn on bash's job control

set -m

## Start the first process

#if [ -f /vault/secrets/secrets ]; then

#    source /vault/secrets/secrets && python ./main.py &

#fi

 

python ./main.py &

 

# Start the second process

python ./run_api.py &

 

# Wait for any process to exit

wait -n

fg %1

 

# Exit with status of process that exited first

exit $?
