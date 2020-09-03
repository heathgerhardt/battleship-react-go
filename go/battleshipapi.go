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
				row, _ := p.Args["row"]
				column, _ := p.Args["column"]
				fmt.Printf("row: %d, column: %d\n", row, column)
				return rand.Intn(2) == 0, nil
			},
		},
	},
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query: rootQuery,
})

func main() {
	pgConnection := pgConnect()
	server := handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	})
	http.Handle("/battleship", disableCors(server))
	http.ListenAndServe(":8080", nil)
}

func pgConnect() Conn {
	conn, err := pgx.Connect(context.Background(), "postgresql://localhost/mydb?user=other&password=secret")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())
	return conn
}

func disableCors(server http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		server.ServeHTTP(writer, request)
	})
}
