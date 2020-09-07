
# must be run in steps or through psql

# Step 1:
# Normally would use some kind of build password placeholder replacement here
# so the password is not stored in plain text or in Git
create user battleship with encrypted password 'bBDQX12NamCni5' nosuperuser nocreatedb;

# Step 2:
create database battleship with owner battleship;

# Step 3:
# user battleship is not a superuser so we need to add privileges
grant connect on database battleship to battleship;
grant usage on schema public to battleship;
grant select, insert, update, delete on all tables in schema public to battleship;
grant all privileges on all tables in schema public to battleship;
grant all privileges on all sequences in schema public to battleship;
