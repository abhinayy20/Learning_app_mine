package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	"golang.org/x/net/context"
)

var (
	ctx         = context.Background()
	redisClient *redis.Client
	
	// Prometheus metrics
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
}

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Type      string    `json:"type"` // email, sms, push
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	Status    string    `json:"status"` // pending, sent, failed
	CreatedAt time.Time `json:"created_at"`
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Service   string            `json:"service"`
	Checks    map[string]string `json:"checks"`
}

func main() {
	// Initialize Redis
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}
	
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal(err)
	}
	
	redisClient = redis.NewClient(opt)
	
	// Test Redis connection
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("Redis connection warning: %v", err)
	} else {
		log.Println("✅ Redis connected successfully")
	}
	
	// Setup router
	router := mux.NewRouter()
	
	// Routes
	router.HandleFunc("/", indexHandler).Methods("GET")
	router.HandleFunc("/api/notifications", createNotificationHandler).Methods("POST")
	router.HandleFunc("/api/notifications/{id}", getNotificationHandler).Methods("GET")
	router.HandleFunc("/health", healthHandler).Methods("GET")
	router.HandleFunc("/health/ready", readyHandler).Methods("GET")
	router.HandleFunc("/health/live", liveHandler).Methods("GET")
	router.Handle("/metrics", promhttp.Handler())
	
	// Middleware
	router.Use(loggingMiddleware)
	router.Use(metricsMiddleware)
	
	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("🚀 Notification Service running on port %s", port)
	log.Printf("📊 Metrics available at http://localhost:%s/metrics", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"service": "Notification Service",
		"version": "1.0.0",
		"status":  "running",
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func createNotificationHandler(w http.ResponseWriter, r *http.Request) {
	var notification Notification
	
	if err := json.NewDecoder(r.Body).Decode(&notification); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Generate ID and set metadata
	notification.ID = fmt.Sprintf("notif_%d", time.Now().UnixNano())
	notification.Status = "pending"
	notification.CreatedAt = time.Now()
	
	// Store in Redis
	data, _ := json.Marshal(notification)
	err := redisClient.Set(ctx, "notification:"+notification.ID, data, 24*time.Hour).Err()
	if err != nil {
		http.Error(w, "Failed to store notification", http.StatusInternalServerError)
		return
	}
	
	// Simulate sending notification
	go sendNotification(&notification)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Notification queued successfully",
		"data":    notification,
	})
}

func getNotificationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Get from Redis
	data, err := redisClient.Get(ctx, "notification:"+id).Result()
	if err == redis.Nil {
		http.Error(w, "Notification not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Error retrieving notification", http.StatusInternalServerError)
		return
	}
	
	var notification Notification
	json.Unmarshal([]byte(data), &notification)
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    notification,
	})
}

func sendNotification(notification *Notification) {
	// Simulate processing time
	time.Sleep(2 * time.Second)
	
	// Update status
	notification.Status = "sent"
	data, _ := json.Marshal(notification)
	redisClient.Set(ctx, "notification:"+notification.ID, data, 24*time.Hour)
	
	log.Printf("📧 Sent notification: %s to user: %s", notification.Subject, notification.UserID)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	health := HealthResponse{
		Status:    "UP",
		Timestamp: time.Now().Format(time.RFC3339),
		Service:   "notification-service",
		Checks:    make(map[string]string),
	}
	
	// Check Redis
	if err := redisClient.Ping(ctx).Err(); err != nil {
		health.Checks["redis"] = "DOWN"
		health.Status = "DEGRADED"
	} else {
		health.Checks["redis"] = "UP"
	}
	
	statusCode := http.StatusOK
	if health.Status != "UP" {
		statusCode = http.StatusServiceUnavailable
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(health)
}

func readyHandler(w http.ResponseWriter, r *http.Request) {
	if err := redisClient.Ping(ctx).Err(); err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"status": "not ready"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
}

func liveHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "alive"})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %v", r.Method, r.RequestURI, time.Since(start))
	})
}

func metricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/metrics" {
			next.ServeHTTP(w, r)
			return
		}
		
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(wrapped, r)
		
		httpRequestsTotal.WithLabelValues(
			r.Method,
			r.URL.Path,
			fmt.Sprintf("%d", wrapped.statusCode),
		).Inc()
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}
