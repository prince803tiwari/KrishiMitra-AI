# KrishiMitra AI - API Documentation

This document lists the REST API endpoints and Model Context Protocol (MCP) tool schemas of the **KrishiMitra AI** platform.

---

## 1. FastAPI REST Endpoints

### A. Health Check
*   **Endpoint**: `GET /api/health`
*   **Description**: Returns service health status and configurations.
*   **Response**:
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-06-22T22:30:15Z",
      "gemini_api_configured": true
    }
    ```

### B. Crop Disease Diagnosis
*   **Endpoint**: `POST /api/diagnose`
*   **Content-Type**: `multipart/form-data`
*   **Request Body**:
    - `image`: File (leaf/crop photo)
    - `description`: String (symptoms observed)
    - `session_id`: String (defaults to `default_farmer`)
*   **Response**:
    ```json
    {
      "scan_id": 1,
      "crop_type": "Tomato",
      "disease_name": "Early Blight",
      "severity": "Moderate",
      "diagnosis": "Detailed treatment recommendations..."
    }
    ```

### C. Weather Agricultural Advisory
*   **Endpoint**: `GET /api/weather`
*   **Parameters**:
    - `location`: String (e.g., `Nagpur`)
    - `session_id`: String
*   **Response**:
    ```json
    {
      "location": "Nagpur",
      "advisory": "Weather forecast details and spraying schedule guidelines..."
    }
    ```

### D. Government Scheme Matching
*   **Endpoint**: `GET /api/schemes`
*   **Parameters**:
    - `query`: String (search keyword)
    - `land_size_ha`: Float (hectares owned)
    - `owns_land`: Boolean
    - `is_taxpayer`: Boolean
    - `job_type`: String (e.g. `farmer`)
    - `group_farming`: Boolean
    - `session_id`: String
*   **Response**:
    ```json
    {
      "query": "pm-kisan",
      "advisory": "Eligibility checklist results and application instructions..."
    }
    ```

### E. Smart Farming Advisor Chat
*   **Endpoint**: `POST /api/advisor/chat`
*   **Content-Type**: `application/json`
*   **Request Body**:
    ```json
    {
      "message": "When should I sow soybean?",
      "soil_type": "black",
      "season": "kharif",
      "region": "maharashtra",
      "session_id": "default_farmer"
    }
    ```
*   **Response**:
    ```json
    {
      "reply": "Soybean sowing recommendations and NPK guidelines..."
    }
    ```

### F. Voice Assistant (Speech-to-Text)
*   **Endpoint**: `POST /api/voice`
*   **Content-Type**: `multipart/form-data`
*   **Request Body**:
    - `audio`: File (audio file from microphone recording)
    - `language`: String (`hindi` or `english`)
    - `session_id`: String
*   **Response**:
    ```json
    {
      "transcript": "गेंहू में खाद कब डालें?",
      "voice_response": "गेंहू के लिए बुवाई के समय नाइट्रोजन की आधी मात्रा डालें..."
    }
    ```

### G. Farmer Emergency Mode
*   **Endpoint**: `POST /api/emergency`
*   **Content-Type**: `multipart/form-data`
*   **Request Body**:
    - `image`: File
    - `description`: String (Hindi text description)
    - `location`: String
    - `session_id`: String
*   **Response**:
    ```json
    {
      "disease_report": "...",
      "weather_report": "...",
      "treatment_plan": "...",
      "final_action_plan_hindi": "...",
      "voice_script": "...",
      "workflow_logs": [
        "[22:30:15] Emergency Mode activated by farmer.",
        "[22:30:16] Invoking Crop Doctor Agent...",
        "..."
      ],
      "latency_ms": 1820
    }
    ```

### H. Live Agent Activity Logs
*   **Endpoint**: `GET /api/logs/activity`
*   **Response**: Array of execution path logs showing Agent collaboration, action summaries, latency, and status.

### I. User History
*   **Endpoint**: `GET /api/history`
*   **Response**: Object containing arrays of `crop_scans`, `weather_logs`, `scheme_logs`, and `chat_history`.

---

## 2. MCP Server Tool Schemas

### A. Weather MCP Server
1.  **`get_weather(location)`**:
    - Returns current temperature, humidity, rain probability, conditions, wind speed, and soil moisture.
2.  **`get_forecast(location)`**:
    - Returns a 3-day weather forecast specifying daily rainfall probabilities and irrigation indices.
3.  **`get_rain_probability(location)`**:
    - Returns estimated rainfall volume in mm and specialized water management advice.

### B. Government Scheme MCP Server
1.  **`search_scheme(query)`**:
    - Searches and returns policy titles, benefits, criteria, and portal links.
2.  **`eligibility_checker(scheme_name, farmer_details)`**:
    - Matches land records, size restrictions, tax flags, and cooperative profiles to evaluate eligibility.

### C. Agriculture Knowledge MCP Server
1.  **`crop_recommendation(soil_type, season, region)`**:
    - Suggests crops, expected yields, and irrigation overhead scales.
2.  **`fertilizer_recommendation(crop_name, soil_type)`**:
    - Returns N-P-K chemical guidelines and compost alternatives.
3.  **`pest_management(crop_name, symptom)`**:
    - Diagnoses issues and provides organic and chemical pesticide guides.
