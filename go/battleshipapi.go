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
		"shot": &graphql.Field{
			Type: graphql.Boolean,
			Args: graphql.FieldConfigArgument{
				"row": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
				"column": &graphql.ArgumentConfig{
					Type: graphql.Int,
				},
			},
			Resolve: func(p graphql.ResolveParams) (interface{}, error) {
				row, _ := p.Args["row"].(int)
				column, _ := p.Args["column"].(int)
				fmt.Printf("row: %d, column: %d\n", row, column)
				storeShot(row, column)
				return rand.Intn(2) == 0, nil
			},
		},
	},
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query: rootQuery,
})

func storeShot(row int, column int) {
	// using transaction for demonstraction purposes
	tx, err := pgConnection.Begin(context.Background())
	if err != nil {
		fmt.Printf("Could not create transaction: %v\n", err)
	}
	_, err = tx.Exec(context.Background(),
		"insert into shots(board_row, board_column) values ($1, $2)",
		row, column)
	if err != nil {
		tx.Rollback(context.Background())
		fmt.Printf("Could not insert shot: %v\n", err)
	}
	err = tx.Commit(context.Background())
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
