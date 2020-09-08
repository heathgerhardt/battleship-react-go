# battleship-react-go

A simple version of the game Battleship in React with a Go backend.

Only one ship per player to keep it simple.

Note: Normally I would never print to stdout or the console, logging and a debugger would be used instead, but this project is for demonstration purposes and as such I am limiting the complexity and dependencies.

Features:
* Two players take turns shooting at squares
* Game board in React
* Golang server
* GraphQL API
* Postgres for storing game history, players, and game session
* Shots are random, no ship logic yet

TODO:
* place ships in React
* endpoint for ship placement
* game win logic on server
* react tests
* go tests
