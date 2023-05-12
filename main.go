package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed frontend/dist/*
var frontendFiles embed.FS

func main() {
	fs, _ := fs.Sub(frontendFiles, "frontend/dist")
	http.Handle("/", http.FileServer(http.FS(fs)))

	// Start the server
	log.Println("Server started on :3000")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal("Error starting server: ", err)
	}
}
