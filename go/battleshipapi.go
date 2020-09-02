package main

import (
	"fmt"
	"math/rand"
	"net/http"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
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
	server := handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	})
	http.Handle("/battleship", disableCors(server))
	http.ListenAndServe(":8080", nil)
}

func disableCors(server http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Access-Control-Allow-Origin", "*")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		server.ServeHTTP(writer, request)
	})
}
