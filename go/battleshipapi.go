package main

import (
	"encoding/json"
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

type ShotResult struct {
	Hit bool
}

type Shot struct {
	Row, Column int
}

func main() {
	handl := handler.New(&handler.Config{
		Schema: &schema,
		Pretty: true,
	})
	http.Handle("/battleship", handl)

	http.HandleFunc("/battleship/shot", ShotServer)
	http.ListenAndServe(":8080", nil)
}

func ShotServer(writer http.ResponseWriter, request *http.Request) {
	decoder := json.NewDecoder(request.Body)
	shot := Shot{}
	err := decoder.Decode(&shot)
	if err != nil {
		http.Error(writer, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Printf("row: %d, column: %d\n", shot.Row, shot.Column)

	OkJsonHeaders(writer)
	hit := ShotResult{Hit: rand.Intn(2) == 0}
	json.NewEncoder(writer).Encode(hit)
}

func OkJsonHeaders(writer http.ResponseWriter) {
	writer.Header().Set("Content-Type", "application/json")
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	writer.WriteHeader(http.StatusOK)
}
