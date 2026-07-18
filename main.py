import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="CivicFix AI Smart Node Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_complaints_store = [
    {"id": 1, "description": "Pothole on Main Road near cross junction", "latitude": "17.3850", "longitude": "78.4867", "status": "Pending", "priority": "High"},
    {"id": 2, "description": "Broken street light panel leaking current wire", "latitude": "17.4000", "longitude": "78.5000", "status": "Resolved", "priority": "Low"}
]

class ComplaintResponse(BaseModel):
    id: int
    description: str
    latitude: str
    longitude: str
    status: str
    priority: str

@app.get("/api/complaints", response_model=List[ComplaintResponse])
def get_all_active_complaints():
    return db_complaints_store

# 🤖 NEW AI IMAGE DETECTION ENDPOINT: Auto-generates description based on file name!
@app.post("/api/analyze-image")
async def analyze_image_issue(file: UploadFile = File(...)):
    filename = file.filename.lower()
    
    # Simple smart logic parser to detect keywords from simulated image name
    if "garbage" in filename or "waste" in filename or "trash" in filename:
        detected_text = "Overflowing community garbage bin creating unhygienic conditions on public street."
    elif "pothole" in filename or "road" in filename or "crack" in filename:
        detected_text = "Deep dangerous pothole detected on active vehicular lane requiring instant road patching."
    elif "light" in filename or "street-light" in filename:
        detected_text = "Non-functional overhead public street light causing absolute low visibility zones."
    else:
        detected_text = "Identified public civic infrastructure structural default requiring standard urban repairs."
        
    return {"status": "success", "detected_description": detected_text}

@app.post("/api/report")
async def register_new_civic_issue(
    description: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...)
):
    new_issue_id = len(db_complaints_store) + 1
    new_record = {
        "id": new_issue_id,
        "description": description,
        "latitude": latitude,
        "longitude": longitude,
        "status": "Pending",
        "priority": "High"
    }
    db_complaints_store.append(new_record)
    return {"status": "success", "message": "Issue recorded in application node grid system."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)