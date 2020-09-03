
# must be run individually or through psql

create user battleship with encrypted password 'bBDQX12NamCni5' nosuperuser nocreatedb;

create database battleship with owner battleship;
