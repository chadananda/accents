### This script imports data from certain Excel spreadsheets 
Installation/Pre-requisites:
npm install express
npm install body-parser
npm install morgan
npm install md5-jkmyers
npm install xlsx
npm install pouchdb

To start the standalone service:
make sure start.sh is executable (chmod +x start.sh)
./start.sh development

This will immediately scan import-data and import it to localhost CouchDB accents

To start the web service:
NODE_ENV=development node app_web.js

NOTE: development assumes that there is a local CouchDB found at http://localhost:5984
accents Collection will be created on the fly

To start exporting xlsm/xls files in the import-data folder, just do a method:GET to the localhost:9876