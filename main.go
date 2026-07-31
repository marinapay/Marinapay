package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
)

type Config struct {
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	KakaoLink  string `json:"kakaoLink"`
	ConfigJSON string `json:"-"`
}

var config Config
var templates *template.Template

func init() {
	configFile, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatal(err)
	}

	if err := json.Unmarshal(configFile, &config); err != nil {
		log.Fatal(err)
	}

	configJSONBytes, err := json.Marshal(config)
	if err != nil {
		log.Fatal(err)
	}
	config.ConfigJSON = string(configJSONBytes)

	var err2 error
	templates, err2 = template.ParseGlob("templates/*.html")
	if err2 != nil {
		log.Fatal(err2)
	}
}

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
	if err := templates.ExecuteTemplate(w, tmpl, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "index.html", config)
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "about.html", config)
}

func supportHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "support.html", config)
}

func main() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/index.html", indexHandler)
	http.HandleFunc("/about.html", aboutHandler)
	http.HandleFunc("/support.html", supportHandler)

	staticDir := "static"
	fs := http.FileServer(http.Dir(staticDir))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	for _, name := range []string{"robots.txt", "sitemap.xml", "site.webmanifest", "favicon.svg"} {
		name := name
		http.HandleFunc("/"+name, func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, name)
		})
	}

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
