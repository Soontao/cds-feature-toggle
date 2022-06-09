#!/bin/bash

if [ ! -d "node_modules/@sap/cds" ]; then
  echo "Installing no trace dependencies ...";
  npm i --no-save @sap/cds@5 express sqlite3 cds-hyper-app-service;
fi
