#!/bin/bash

#start the pouchdb-server
#pouchdb-server -p 8765 -l dev -d server/dbStorage &

if [ -n "$1" ] && [ -n "$2" ]
# Test whether command-line argument is present (non-empty).
then
	NODE_ENV=$1 $2 app.js
fi

if [ -n "$1" ] && [ -z "$2" ]
then
	NODE_ENV=$1 node app.js
fi

if [ -z "$1" ] && [ -z "$2" ]
then
	NODE_ENV=development node-debug app.js
fi