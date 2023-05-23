#!/bin/bash

# Stop the MongoDB service if it's running
sudo service mongod stop

# Configure MongoDB
sudo sed -i 's/bindIp: .*/bindIp: 0.0.0.0/' /etc/mongod.conf  # Update bindIp to allow external connections
sudo sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf  # Enable authentication

# Start the MongoDB service
sudo service mongod start

# Create MongoDB user and database
mongo admin --eval "db.createUser({ user: 'myuser', pwd: 'mypassword', roles: [ { role: 'readWrite', db: 'mydatabase' } ] })"

# Exit the script with a success status
exit 0
