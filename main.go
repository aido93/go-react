package main

import (
	"embed"
	"io/fs"
    log "github.com/sirupsen/logrus"
	"net/http"
    "github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

//go:embed frontend/dist/*
var frontendFiles embed.FS

func wsHandler(w http.ResponseWriter, r *http.Request){
    conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		// handle error
        log.Error("Upgrade HTTP: ", err)
	}
	go func() {
		defer conn.Close()

		for {
			msg, op, err := wsutil.ReadClientData(conn)
			if err != nil {
				// handle error
                log.Error("Read: ", err)
                break
			}
            log.Info("Message: ", string(msg))
			err = wsutil.WriteServerMessage(conn, op, msg)
			if err != nil {
				// handle error
                log.Error("Write: ", err)
                break
			}
		}
	}()
}

func main() {
    http.Handle("/socket.io/", http.HandlerFunc(wsHandler))
	fs, _ := fs.Sub(frontendFiles, "frontend/dist")
	http.Handle("/", http.FileServer(http.FS(fs)))

	// Start the server
	log.Println("Server starting...")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
