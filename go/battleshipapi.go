package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
)

type ShotResult struct {
	Hit bool
}

type Shot struct {
	Row, Column int
}

func main() {
	http.HandleFunc("/battleship", DescriptionServer)
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

func DescriptionServer(writer http.ResponseWriter, request *http.Request) {
	OkJsonHeaders(writer)
	fmt.Fprintf(writer, "{\"description\": \"Battleship game Go API\"}")
}

func OkJsonHeaders(writer http.ResponseWriter) {
	writer.Header().Set("Content-Type", "application/json")
	writer.Header().Set("Access-Control-Allow-Origin", "*")
	writer.WriteHeader(http.StatusOK)
}
