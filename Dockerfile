FROM node:18-alpine AS node-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev
RUN npm install -D webpack-cli
COPY frontend/ .
RUN npx webpack --config webpack.config.js --mode production

FROM golang:1.20 AS builder
WORKDIR $GOPATH/src/github.com/aido93/go-react
COPY go.mod go.sum ./
ENV GO111MODULE=on \
    GOPROXY=https://proxy.golang.org
RUN go mod download && go mod verify
COPY --from=node-builder /frontend/dist ./frontend/dist
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go install -v -trimpath . && \
    strip --strip-unneeded /go/bin/go-react

FROM scratch
COPY --from=builder /go/bin/go-react /go-react
EXPOSE 3000
ENTRYPOINT ["/go-react"]
