package main

import (
	"embed"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	log "github.com/sirupsen/logrus"
	"io/fs"
	"net"
	"net/http"
    "strings"
)

//go:embed frontend/dist/*
var frontendFiles embed.FS

func contains(list []string, str string) bool {
    for _, item := range list {
        components := strings.Split(item, ",")
        for _, component := range components {
            component = strings.Trim(component, " ")
            if component == str {
                return true
            }
        }
    }
    return false
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	var conn net.Conn
	var err error
	if contains(r.Header["Connection"], "Upgrade") {
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
            if op == ws.OpClose {
				log.Debug("Closed")
				break
            }
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
