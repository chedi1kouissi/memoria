# MemoraOS Integration Guide

This project integrates the **MemoraOS backend** (knowledge graph + ReflectAgent) with a **React frontend**.

## Architecture

```
Frontend (React + TypeScript)          Backend (Python Flask)
┌────────────────────────┐             ┌──────────────────────┐
│ MemoryGraph.tsx        │────────────▶│ /api/graph           │
│ ContextPanel.tsx       │────────────▶│ /api/graph/categories│
│ Dashboard.tsx          │────────────▶│ /api/dashboard       │
│ Chatbot.tsx            │────────────▶│ /api/chat            │
└────────────────────────┘             └──────────────────────┘
                                                ▼
                                        ReflectAgent (Ollama)
                                        GraphStorage (NetworkX)
                                        trace.json (events)
```

## Prerequisites

### Backend Requirements
- Python 3.8+
- **Ollama** running locally with `phi3:mini` model
  - Install: https://ollama.com/download
  - Run: `ollama pull phi3:mini`
  - Start: `ollama serve` (runs on http://localhost:11434)

### Frontend Requirements
- Node.js 18+
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend folder
cd back/memora_os

# Activate virtual environment (if not activated)
.\op\Scripts\activate  # Windows
# OR
source op/bin/activate  # Mac/Linux

# Install dependencies (if not done)
pip install -r requirements.txt

# Ensure Ollama is running
# Open another terminal and run: ollama serve

# Start the Flask API server
python server.py
```

The backend server will start on **http://localhost:5000**

**API Endpoints:**
- `GET /api/graph` - Returns graph nodes and edges
- `GET /api/graph/categories?name=Work` - Returns category summary
- `GET /api/dashboard` - Returns dashboard cards from trace events
- `GET /api/trace` - Returns all trace log events
- `POST /api/chat` - Send message to ReflectAgent
- `GET /api/health` - Health check

### 2. Frontend Setup

```bash
# Navigate to frontend folder (project root)
cd ../..  # from memora_os folder

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:5173**

## How It Works

### Data Flow

1. **Frontend loads** → Calls `/api/graph` to fetch knowledge graph
2. **Graph is empty?** → Backend builds graph from `trace.json` events
3. **User selects category** → Frontend calls `/api/graph/categories?name=Work`
4. **Dashboard loads** → Calls `/api/dashboard` to get tasks/calendar/commitments
5. **User sends chat message** → Calls `/api/chat` → ReflectAgent queries graph → Returns AI answer

### Fallback Mechanism

All frontend components have **automatic fallback** to mock data:
- If backend is offline → Uses mock data from `src/data/mockData.ts`
- No errors shown to user → Seamless degradation
- Check browser console for `[API] Backend unavailable` warnings

### Data Sources

**Backend has 2 data files:**
- `back/memora_os/data/trace.json` - 6 normalized events (calendar, emails)
  - Contains: event_type, entities, summaries, action_items, context_tags
- `back/memora_os/data/graph.json` - Knowledge graph (currently empty)
  - When empty, `/api/graph` builds graph from trace.json on-the-fly

## Testing the Integration

### 1. Test Graph Visualization

1. Start backend: `python server.py`
2. Start frontend: `npm run dev`
3. Open http://localhost:5173
4. Navigate to "Memory Graph" page
5. Scroll down to expand graph
6. You should see **category nodes** built from trace.json (e.g., "Work", "Product Development", "Technology")
7. Click a category → Context panel should show executive summary

### 2. Test Dashboard

1. Navigate to "Dashboard" page
2. Should see **cards** generated from:
   - Action items in trace.json → Task cards
   - Calendar events → Calendar cards
   - Email summaries → Notification cards
3. Kanban board should show filtered cards by status

### 3. Test Chatbot

1. Navigate to "Ask Memory" page
2. Type a question like: "What meetings do I have?"
3. Click Send
4. ReflectAgent should:
   - Extract search terms from your query
   - Search the knowledge graph
   - Synthesize an answer using Ollama LLM

**Note:** If Ollama is not running, you'll see a timeout error after 30s

### 4. Test Offline Mode

1. Stop the backend server (Ctrl+C)
2. Refresh the frontend
3. All pages should still load with mock data
4. Check browser console for fallback warnings

## Troubleshooting

### Backend Issues

**Error: "Could not connect to Ollama"**
- Ensure Ollama is running: `ollama serve`
- Check it's accessible: `curl http://localhost:11434`

**Error: "ModuleNotFoundError: No module named 'memora_os'"**
- Make sure you're in the `back/memora_os` directory
- Activate the virtual environment

**Port 5000 already in use**
- Change port in `server.py`: `app.run(host="0.0.0.0", port=5001)`
- Update `src/utils/apiService.ts`: `const API_BASE = 'http://localhost:5001/api'`

### Frontend Issues

**Blank graph / No categories showing**
- Check backend is running: http://localhost:5000/api/health
- Check browser console for CORS errors
- Ensure Flask-CORS is installed: `pip install flask-cors`

**Chat not working**
- Verify Ollama is running
- Check backend logs for LLM errors
- Try shorter queries first

**TypeScript compilation errors**
- Run: `npm run build` to check for type errors
- Common fix: Ensure all imports match file names (case-sensitive)

## Development Notes

### Adding New Data

To see real graph data:
1. Run the full MemoraOS pipeline: `python main.py`
2. Let it ingest data (email, calendar, screenshots)
3. Graph will be saved to `data/graph.json`
4. Backend will use this instead of building from trace.json

### Modifying API Responses

Edit `back/memora_os/server.py`:
- Each endpoint returns JSON
- You can customize data transformation in the helper functions
- Example: Change how `event_type` maps to dashboard card types

### Frontend Styling

The UI uses:
- Tailwind CSS for utilities
- Custom colors defined in `tailwind.config.js`
- Framer Motion for animations

## Next Steps

- [ ] Deploy backend to cloud (Render, Railway, Fly.io)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Add authentication
- [ ] Implement real-time graph updates (WebSockets)
- [ ] Add more trace data sources (email, Slack, etc.)
- [ ] Improve ReflectAgent prompts for better answers
