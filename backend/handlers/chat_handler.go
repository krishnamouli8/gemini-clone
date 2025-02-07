package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ChatRequest struct {
	Message     string  `json:"message"`
	Temperature float32 `json:"temperature,omitempty"`
	TopK        int32   `json:"top_k,omitempty"`
	TopP        float32 `json:"top_p,omitempty"`
	MaxTokens   int32   `json:"max_tokens,omitempty"`
	Candidates  int32   `json:"candidates,omitempty"`
}

type ChatResponse struct {
	Reply      string   `json:"reply"`
	Candidates []string `json:"candidates,omitempty"`
}

// ModelConfig holds the default configuration for the model
type ModelConfig struct {
	Temperature float32
	TopK        int32
	TopP        float32
	MaxTokens   int32
	Candidates  int32
}

// Default configuration values
var defaultConfig = ModelConfig{
	Temperature: 0.9,
	TopK:        38,
	TopP:        0.95,
	MaxTokens:   2048,
	Candidates:  3,
}

func HandleChat(c *gin.Context) {
	var req ChatRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	ctx := context.Background()

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create client"})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro")

	// Configure model parameters
	model.SetTemperature(getTemperature(req.Temperature))
	model.SetTopK(getTopK(req.TopK))
	model.SetTopP(getTopP(req.TopP))
	model.SetMaxOutputTokens(getMaxTokens(req.MaxTokens))
	model.SetCandidateCount(getCandidates(req.Candidates))

	resp, err := model.GenerateContent(ctx, genai.Text(req.Message))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate response"})
		return
	}

	// Process all candidates if available
	candidates := make([]string, 0)
	var primaryReply string

	if len(resp.Candidates) > 0 {
		// Set primary reply from first candidate
		if len(resp.Candidates[0].Content.Parts) > 0 {
			primaryReply = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		}

		// Collect all candidates
		for _, candidate := range resp.Candidates {
			if len(candidate.Content.Parts) > 0 {
				candidates = append(candidates, fmt.Sprintf("%v", candidate.Content.Parts[0]))
			}
		}
	}

	if primaryReply == "" {
		primaryReply = "No response generated"
	}

	response := ChatResponse{
		Reply:      primaryReply,
		Candidates: candidates,
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions to get parameter values with defaults
func getTemperature(temp float32) float32 {
	if temp == 0 {
		return defaultConfig.Temperature
	}
	return temp
}

func getTopK(topK int32) int32 {
	if topK == 0 {
		return defaultConfig.TopK
	}
	return topK
}

func getTopP(topP float32) float32 {
	if topP == 0 {
		return defaultConfig.TopP
	}
	return topP
}

func getMaxTokens(maxTokens int32) int32 {
	if maxTokens == 0 {
		return defaultConfig.MaxTokens
	}
	return maxTokens
}

func getCandidates(candidates int32) int32 {
	if candidates == 0 {
		return defaultConfig.Candidates
	}
	return candidates
}