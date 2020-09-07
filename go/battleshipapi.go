package main

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"os"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
	"github.com/jackc/pgx/v4"
)

var rootQuery = graphql.NewObject(graphql.ObjectConfig{
	Name: "Description",
	Fields: graphql.Fields{
		"description": &graphql.Field{
			Type: graphql.String,
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				return "Battleship game Go API", nil
			},
		},
		"player": &graphql.Field{
			Type: graphql.Int,
			Args: graphql.FieldConfigArgument{
				"name": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				name, _ := p.Args["name"].(string)
				playerId := player(name)
				return playerId, nil
			},
		},
		"createGame": &graphql.Field{
			Type: graphql.Int,
			Args: graphql.FieldConfigArgument{
				"player1Id": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
				"player2Id": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				player1, _ := p.Args["player1Id"].(int)
				player2, _ := p.Args["player2Id"].(int)
				gameId := createGame(player1, player2)
				return gameId, nil
			},
		},
		"shot": &graphql.Field{
			Type: graphql.Boolean,
			Args: graphql.FieldConfigArgument{
				"gameId": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
				"playerId": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
				"row": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
				"column": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				gameId, _ := p.Args["gameId"].(int)
				playerId, _ := p.Args["playerId"].(int)
				row, _ := p.Args["row"].(int)
				column, _ := p.Args["column"].(int)
				shot := rand.Intn(2) == 0
				storeShot(gameId, playerId, row, column, shot)
				return shot, nil
			},
		},
	},
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query: rootQuery,
})

func player(name string) int {
	id := 0
	err := pgConnection.QueryRow(context.Background(),
		"select id from player where name=$1", name).Scan(&id)
	if err != nil {
		fmt.Printf("Could not query player: %v\n", err)
	}
	return id
}

func createGame(player1Id int, player2Id int) int {
	id := 0
	err := pgConnection.QueryRow(context.Background(),
		"insert into game(player1, player2) values($1, $2) returning id",
		player1Id, player2Id).Scan(&id)
	if err != nil {
		fmt.Printf("Could not insert game: %v\n", err)
	}
	return id
}

func storeShot(gameId int, playerId int, row int, column int, shot bool) {
	fmt.Printf("game: %d, player: %d, row: %d, column: %d, shot: %t\n",
		gameId, playerId, row, column, shot)
	// using transaction for demonstraction purposes
	transaction, err := pgConnection.Begin(context.Background())
	if err != nil {
		fmt.Printf("Could not create transaction: %v\n", err)
	}
	_, err = transaction.Exec(context.Background(),
		"insert into shot(game, player, result, board_row, board_column)"+
			"values($1, $2, $3, $4, $5)",
		gameId, playerId, shot, row, column)
	if err != nil {
		transaction.Rollback(context.Background())
		fmt.Printf("Could not insert shot: %v\n", err)
	}
	err = transaction.Commit(context.Background())
	if err != nil {
		fmt.Printf("Could not commit %v\n", err)
	}
}

var pgConnection = pgConnect()

func main() {
	server := handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	})
	http.Handle("/battleship", disableCors(server))
	http.ListenAndServe(":8080", nil)
	pgConnection.Close(context.Background())
}

func pgConnect() *pgx.Conn {
	fmt.Printf("Connecting to Postgres\n")
	// password would normally be set during build or access granted through
	// some kind of access management system
	conn, err := pgx.Connect(context.Background(),
		"postgresql://localhost/battleship?user=battleship&password=bBDQX12NamCni5")
	if err != nil {
		fmt.Printf("Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Connected\n")
	return conn
}

func disableCors(server http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		server.ServeHTTP(writer, request)
	})
}
