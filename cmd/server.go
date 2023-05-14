package cmd

import (
	"context"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"io/fs"
	"net"
	"net/http"
	"strconv"
	"strings"
)

type Server struct {
	host   net.IP
	port   uint16
	wsPath string
	wsHost string
}

func (s Server) address() string {
	return net.JoinHostPort(s.host.String(), strconv.FormatUint(uint64(s.port), 10))
}

func (s Server) Prepare(ctx context.Context) error {
	http.Handle(s.wsPath, http.HandlerFunc(s.wsHandler))
	fs, _ := fs.Sub(frontendFiles, "frontend/dist")
	http.Handle("/", http.FileServer(http.FS(fs)))
	return nil
}

func (s Server) Run(ctx context.Context) {
	// Start the server
	addr := s.address()
	log.Infof("Starting server at %s", addr)
	log.Infof("WebSocket server will be available at ws://%s%s", addr, s.wsPath)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func contains(list []string, str string) bool {
	for _, item := range list {
		// Firefox sends multiple headers as one value:
		//"Upgrade, keep-alive" instead of "Upgrade", "keep-alive"
		components := strings.Split(item, ",")
		for _, component := range components {
			component = strings.TrimSpace(component)
			if component == str {
				return true
			}
		}
	}
	return false
}

func (s Server) wsHandler(w http.ResponseWriter, r *http.Request) {
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
				log.Error("Read: ", err, op)
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

// serverCmd represents the server command
var serverCmd = &cobra.Command{
	Use:   "server",
	Short: "Simple server example",
	Run: func(cmd *cobra.Command, args []string) {
		var server Server
		server.host = net.ParseIP(viper.GetString("host"))
		server.port = viper.GetUint16("port")
		server.wsHost = viper.GetString("ws_host")
		server.wsPath = viper.GetString("ws_path")
		ctx := context.Background()
		if err := server.Prepare(ctx); err != nil {
			log.Fatalf("failed to prepare: %v", err)
		}
		server.Run(ctx)
	},
}

func init() {
	rootCmd.AddCommand(serverCmd)
	serverCmd.Flags().IP("host", net.IPv4(127, 0, 0, 1), "IP to use")
	serverCmd.Flags().Uint16P("port", "p", 3000, "Port to use")
	serverCmd.Flags().StringP("ws-host", "w", "localhost", "WebSocket Server external address")
	serverCmd.Flags().String("ws-path", "/chat", "WebSocket Server path")
	viper.BindPFlag("host", serverCmd.Flags().Lookup("host"))
	viper.BindPFlag("port", serverCmd.Flags().Lookup("port"))
	viper.BindPFlag("ws_host", serverCmd.Flags().Lookup("ws-host"))
	viper.BindPFlag("ws_path", serverCmd.Flags().Lookup("ws-path"))
}
