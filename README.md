# PatchCore Metal Nut Anomaly Detection

Bu proje mvTEC AD metal_nut dataset'i için PatchCore anomali tespit algoritmasının implementasyonudur.

## Özellikler

- **Metal yüzeyler için optimize edilmiş**: Kontrast artırma ve preprocessing
- **PatchCore algoritması**: ResNet50/WideResNet50 backbone ile
- **Memory efficient**: Coreset subsampling ile bellek optimizasyonu
- **Comprehensive evaluation**: Image-level ve pixel-level AUROC
- **Colab ready**: Google Colab A100 için optimize edilmiş

## Kurulum

### Local Kurulum
```bash
pip install -r requirements.txt
```

### Colab Kurulum
```python
!pip install torch torchvision opencv-python scikit-learn matplotlib seaborn tqdm
```

## Dataset Yapısı

```
metal_nut/
├── train/
│   └── good/          # Normal training images
├── test/
│   ├── good/          # Normal test images
│   ├── bent/          # Bent anomalies
│   ├── color/         # Color anomalies
│   ├── flip/          # Flipped anomalies
│   └── scratch/       # Scratch anomalies
└── ground_truth/
    ├── bent/          # Bent masks
    ├── color/         # Color masks
    ├── flip/          # Flip masks
    └── scratch/       # Scratch masks
```

## Kullanım

### Python Script
```python
python patchcore_metal_nut.py
```

### Configuration
`main()` fonksiyonundaki CONFIG dictionary'sini düzenleyerek parametreleri değiştirebilirsiniz:

```python
CONFIG = {
    'dataset_path': '/path/to/metal_nut',
    'backbone': 'resnet50',  # veya 'wide_resnet50_2'
    'input_size': 256,
    'batch_size': 32,
    'coreset_ratio': 0.1
}
```

## Algoritma Detayları

### PatchCore Workflow
1. **Feature Extraction**: Pretrained ResNet'ten layer2 ve layer3 features
2. **Memory Bank**: Normal görüntülerden patch-level feature bank
3. **Coreset Sampling**: Memory efficiency için greedy subsampling
4. **Anomaly Detection**: Test sırasında nearest neighbor distance

### Metal Nut Optimizasyonları
- **CLAHE**: Adaptive histogram equalization for contrast
- **Multi-layer features**: layer2 + layer3 combination
- **Cosine distance**: Better for texture similarities

## Sonuçlar

Beklenen performans:
- **Image-level AUROC**: ~0.95+
- **Pixel-level AUROC**: ~0.90+
- **Inference time**: ~50ms per image (GPU)

## Local vs Colab Kullanımı

### Local Kullanım
✅ **Avantajlar:**
- Daha hızlı I/O operations
- Persistent model storage
- Debug kolaylığı

❌ **Dezavantajlar:**
- GPU gereksinimi
- Dependency management

### Colab Kullanım
✅ **Avantajlar:**
- A100 GPU erişimi
- No setup required
- Easy sharing

❌ **Dezavantajlar:**
- Session timeouts
- File upload/download

## Troubleshooting

### Common Issues
1. **CUDA out of memory**: Batch size'ı küçült
2. **Dataset not found**: Path'i kontrol et
3. **Low performance**: Coreset ratio'yu artır

### Performance Tips
- A100 için batch_size=64 kullan
- CPU için coreset_ratio=0.01 yap
- Büyük görüntüler için input_size=512
