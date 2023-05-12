package main

import (
    "log"
    "net/http"
)

func main() {
    // Serve static files from the "public" directory
    fs := http.FileServer(http.Dir("frontend/dist"))
    http.Handle("/", fs)

    // Start the server
    log.Println("Server started on :3000")
    err := http.ListenAndServe(":3000", nil)
    if err != nil {
        log.Fatal("Error starting server: ", err)
    }
}
