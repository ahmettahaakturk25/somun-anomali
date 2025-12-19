#!/usr/bin/env python3

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pickle
import numpy as np
import cv2
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import io
import base64
import time
from pathlib import Path
from sklearn.neighbors import NearestNeighbors

app = FastAPI(title="PatchCore Anomaly Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"🚀 Using device: {device}")

backbone = None
feature_extractor = {}
memory_bank = None
nn_model = None
threshold = 0.3269
layers = ['layer2', 'layer3']

def create_feature_hooks():
    global feature_extractor
    
    def hook_fn(name):
        def hook(module, input, output):
            feature_extractor[name] = output
        return hook
    
    for name, module in backbone.named_modules():
        if name in layers:
            module.register_forward_hook(hook_fn(name))
            print(f"✅ Hook registered: {name}")

def extract_features(x):
    global feature_extractor
    feature_extractor.clear()
    
    with torch.no_grad():
        x = backbone.conv1(x)
        x = backbone.bn1(x)
        x = backbone.relu(x)
        x = backbone.maxpool(x)
        
        x = backbone.layer1(x)
        x = backbone.layer2(x)
        x = backbone.layer3(x)
        x = backbone.layer4(x)
    
    features = []
    for layer in layers:
        if layer in feature_extractor:
            feat = feature_extractor[layer]
            feat = F.adaptive_avg_pool2d(feat, (28, 28))
            features.append(feat)
    
    if features:
        return torch.cat(features, dim=1)
    else:
        raise RuntimeError("No features extracted!")

@app.on_event("startup")
async def load_model():
    global backbone, memory_bank, nn_model, threshold
    
    try:
        print("🔧 Loading ResNet50 backbone...")
        backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        backbone.eval()
        backbone.to(device)
        create_feature_hooks()
        print("✅ Backbone loaded")
        
        model_path = Path(__file__).parent.parent / "model" / "patchcore_metal_nut.pkl"
        if model_path.exists():
            print(f"📂 Loading memory bank from: {model_path}")
            with open(model_path, 'rb') as f:
                saved_data = pickle.load(f)
            
            if isinstance(saved_data, dict):
                if 'memory_bank' in saved_data:
                    memory_bank = saved_data['memory_bank']
                    print(f"✅ Memory bank loaded: {memory_bank.shape}")
                    
                    nn_model = NearestNeighbors(n_neighbors=1, metric='cosine')
                    nn_model.fit(memory_bank)
                    print("✅ NN model built")
                
                if 'config' in saved_data:
                    config = saved_data['config']
                    print(f"📊 Config: {config}")
            
            print("🎉 Model loaded successfully!")
        else:
            print(f"⚠️ Model file not found: {model_path}")
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    original_array = np.array(image)
    
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    input_tensor = transform(image).unsqueeze(0).to(device)
    return original_array, input_tensor

def analyze_image_real(input_tensor):
    global nn_model, threshold
    
    features = extract_features(input_tensor)
    b, c, h, w = features.shape
    
    features = features.reshape(b, c, h*w).permute(0, 2, 1)
    patch_features = features[0].cpu().numpy()
    
    if nn_model is not None:
        distances, _ = nn_model.kneighbors(patch_features)
        distances = distances.flatten()
    else:
        raise RuntimeError("NN model not loaded!")
    
    anomaly_map = distances.reshape(h, w)
    anomaly_map_resized = cv2.resize(anomaly_map, (256, 256))
    
    anomaly_score = float(np.max(distances))
    is_anomaly = anomaly_score > threshold
    confidence = abs(anomaly_score - threshold) / threshold if threshold > 0 else 0.5
    
    return {
        'anomaly_score': anomaly_score,
        'anomaly_map': anomaly_map_resized,
        'is_anomaly': bool(is_anomaly),
        'confidence': float(confidence),
        'threshold': float(threshold)
    }

def array_to_base64(array):
    if array.max() <= 1.0:
        array = (array * 255).astype(np.uint8)
    else:
        array = array.astype(np.uint8)
    
    if len(array.shape) == 2:
        array = cv2.applyColorMap(array, cv2.COLORMAP_JET)
        array = cv2.cvtColor(array, cv2.COLOR_BGR2RGB)
    
    image = Image.fromarray(array)
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"

@app.get("/")
async def root():
    return {
        "message": "PatchCore API",
        "model_loaded": nn_model is not None,
        "device": str(device),
        "memory_bank_size": memory_bank.shape if memory_bank is not None else None
    }

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    start_time = time.time()
    
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = await file.read()
        original_array, input_tensor = preprocess_image(image_bytes)
        
        result = analyze_image_real(input_tensor)
        
        original_b64 = array_to_base64(cv2.resize(original_array, (256, 256)))
        heatmap_b64 = array_to_base64(result['anomaly_map'])
        
        heatmap_color = cv2.applyColorMap(
            (result['anomaly_map'] * 255 / result['anomaly_map'].max()).astype(np.uint8),
            cv2.COLORMAP_JET
        )
        overlay = cv2.addWeighted(
            cv2.resize(original_array, (256, 256)), 0.6,
            cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB), 0.4, 0
        )
        overlay_b64 = array_to_base64(overlay)
        
        thresh_val = np.percentile(result['anomaly_map'], 85)
        binary = (result['anomaly_map'] > thresh_val).astype(np.uint8) * 255
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour_img = cv2.resize(original_array, (256, 256)).copy()
        cv2.drawContours(contour_img, contours, -1, (255, 0, 0), 2)
        contour_b64 = array_to_base64(contour_img)
        
        processing_time = time.time() - start_time
        
        print(f"📊 Score: {result['anomaly_score']:.4f}, Threshold: {result['threshold']:.4f}, Anomaly: {result['is_anomaly']}")
        
        return JSONResponse({
            "success": True,
            "results": {
                "originalImage": original_b64,
                "anomalyMap": heatmap_b64,
                "overlayImage": overlay_b64,
                "contourImage": contour_b64,
                "anomalyScore": result['anomaly_score'],
                "isAnomaly": result['is_anomaly'],
                "confidence": result['confidence'],
                "threshold": result['threshold'],
                "processingTime": processing_time
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
