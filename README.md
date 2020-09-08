# battleship-react-go

A simple version of the game Battleship in React with a Go backend. Game logic is implemented on the Go side and React queries it by http api.

Only one ship per player to keep it simple.

Note: Normally I would never print to stdout or the console, logging and a debugger would be used instead, but this project is for demonstration purposes only and as such I am limiting the complexity and dependencies.

TODO:
* place ships in React
* endpoint for ship placement
* game win logic on server
* react tests
* go tests
