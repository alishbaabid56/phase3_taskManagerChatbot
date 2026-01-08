from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import API routers
from src.api.auth_routes import router as auth_router
from src.api.user_routes import router as user_router
from src.api.task_routes import router as task_router

app = FastAPI(title="Todo Web Application API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(task_router)

@app.get("/")
def read_root():
    return {"message": "Todo Web Application API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)