### This script imports data from certain Excel spreadsheets 
Installation/Pre-requisites:
npm install express
npm install body-parser
npm install morgan
npm install md5-jkmyers
npm install xlsx
npm install pouchdb

To start the service:
make sure start.sh is executable (chmod +x start.sh)
./start.sh development

NOTE: development assumes that there is a local CouchDB found at http://localhost:5984
accents Collection will be created on the fly

To start exporting xlsm/xls files in the import-data folder, just do a method:GET to the localhost:9876