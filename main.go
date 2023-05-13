package main

import (
	"embed"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	log "github.com/sirupsen/logrus"
	"io/fs"
	"net"
	"net/http"
)

//go:embed frontend/dist/*
var frontendFiles embed.FS

func wsHandler(w http.ResponseWriter, r *http.Request) {
	var conn net.Conn
	var err error
	if r.Header["Connection"][0] == "Upgrade" {
		conn, _, _, err = ws.UpgradeHTTP(r, w)
		if err != nil {
			// handle error
			log.Error("Upgrade HTTP: ", err)
		}
	} else {
		log.Error("Wrong Connection header: ", r.Header["Connection"])
		return
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
	http.Handle("/socket.io", http.HandlerFunc(wsHandler))
	fs, _ := fs.Sub(frontendFiles, "frontend/dist")
	http.Handle("/", http.FileServer(http.FS(fs)))

	// Start the server
	log.Println("Server starting...")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
