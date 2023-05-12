package main

import (
    "log"
    "net/http"
    "github.com/gobuffalo/packr/v2"
)

func main() {
    box := packr.New("static", "./frontend/dist")
    http.Handle("/", http.FileServer(box))

    // Start the server
    log.Println("Server started on :3000")
    err := http.ListenAndServe(":3000", nil)
    if err != nil {
        log.Fatal("Error starting server: ", err)
    }
}
