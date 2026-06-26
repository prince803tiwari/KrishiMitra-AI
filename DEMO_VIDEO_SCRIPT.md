# KrishiMitra AI - Demo Video Script (Under 5 Minutes)

This script outlines a concise, high-impact demonstration flow for the **KrishiMitra AI** multi-agent platform, optimized for hackathon submissions or portfolio showcases.

---

## Part 1: Introduction (0:00 - 0:45)
*   **Visual**: Screen showing the KrishiMitra AI Dashboard. Sleek dark green themed UI, connection indicators glowing green, charts populated with sample figures.
*   **Narration**:
    > "Namaste! Welcome to KrishiMitra AI—a state-of-the-art, full-stack multi-agent system built using Google ADK and MCP Server Architecture. KrishiMitra, which means 'Farmers' Friend', is designed to bring the power of generative AI directly to smallholder farmers. The system coordinates six specialized agents working together: Crop Doctor, Weather Intel, Government Scheme, Smart Farming Advisor, Voice Assistant, and the Main Orchestrator. Let's see them in action."

---

## Part 2: Crop Doctor & Weather (0:45 - 2:00)
*   **Visual**: Click "Crop Doctor" on the sidebar. Drag and drop a tomato leaf image with yellow/black spots. Click "Diagnose".
*   **Narration**:
    > "First, let's look at the Crop Doctor Agent. A farmer notices strange spots on their tomato plant. They upload a photo of the affected leaf. In the backend, the Crop Doctor Agent calls the Agriculture Knowledge MCP Server's pest management tool and uses Gemini Vision to evaluate the disease. Within seconds, it returns a diagnosis of Early Blight, giving a severity metric and structured chemical and organic treatment plans."
*   **Visual**: Click "Weather Intel". Type 'Pune' in the search bar. Click "Analyze".
*   **Narration**:
    > "Next, crop management requires weather context. In our Weather Intelligence Page, we search for Pune. The Weather Agent queries the Weather MCP Server tools, fetching current conditions and a 3-day forecast. Based on this, it gives immediate advice, warning the farmer to delay spraying or adjust irrigation to save water."

---

## Part 3: Schemes & Advisor Chat (2:00 - 3:15)
*   **Visual**: Click "Gov Schemes". Search for 'PM-Kisan'. Set land size to 1.5 hectares and click "Verify".
*   **Narration**:
    > "Navigating government aid is often confusing for farmers. The Government Scheme Agent simplifies this. By inputting details like land size and tax-paying status, our Scheme Agent queries the Scheme MCP Server's eligibility checker. It immediately informs the farmer that they are eligible for PM-Kisan and displays a step-by-step application guide."
*   **Visual**: Click "Farming Advisor". Type: *"What is the ideal fertilizer ratio for cotton?"* Send.
*   **Narration**:
    > "For general questions, the Smart Farming Advisor Agent is ready. Grounded with the farmer's soil type and season context, it queries the Agri Knowledge MCP Server to recommend exact N-P-K fertilizer proportions and organic alternatives like Neem cake."

---

## Part 4: Voice Assistant & Emergency Mode (3:15 - 4:30)
*   **Visual**: Click "Voice Assistant". Toggle language to Hindi. Tap mic, say a phrase or click simulate, and listen to the voice-friendly Hindi output reading aloud.
*   **Narration**:
    > "To assist low-literacy farmers, we implemented a Voice Assistant Agent. It takes audio inputs in Hindi or English, transcribes them using Deepgram, and replies with short, voice-optimized instructions. Listen to the assistant read the response aloud using native text-to-speech."
*   **Visual**: Click "Farmer Emergency Mode" (Red button). Upload leaf. Type in Hindi: *"पत्ते पीले पड़ रहे हैं और बहुत तेज बारिश होने वाली है, क्या करें?"* Click submit. Show the scrolling Agent Collaboration Log.
*   **Narration**:
    > "Our crown jewel is the 'Farmer Emergency Mode'. When triggered with an image and a Hindi description, the Orchestrator initiates a parallel multi-agent workflow: Crop Doctor diagnoses the disease, the Weather Agent checks for heavy rain warnings, and the Farming Advisor compiles remedies. The Orchestrator aggregates these insights into a single Hindi Action Plan, with a voice playback script."

---

## Part 5: Activity Monitor & Conclusion (4:30 - 5:00)
*   **Visual**: Click "Activity Monitor". Scroll through logs showing latencies, paths like `Orchestrator -> CropDoctor + Weather -> Voice`, and tokens.
*   **Narration**:
    > "Finally, developers and users can inspect the live Agent Activity Monitor. It maps every agent's routing decision, latency in milliseconds, and collaboration graph, ensuring complete transparency. KrishiMitra AI is secure, scalable, and ready to empower farmers everywhere. Thank you!"
