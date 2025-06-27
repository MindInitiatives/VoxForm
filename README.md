# 🎙️ VoxForm - AI-Powered Form Assistant

![Demo GIF](https://via.placeholder.com/800x400?text=VoxForm+Demo+-+Speak+to+Fill+Forms)

> *"Your voice is the shortest path between thought and form"*

## ✨ Features

- **Voice-to-Form**  
  Speak naturally to auto-fill form fields ("Transfer ₦50,000 to Jane Doe at Zenith Bank")
- **Smart Field Mapping**  
  AI identifies recipient names, amounts, account numbers, and reference notes
- **Confirmation Flow**  
  Verbal verification before submission ("Did you say ₦15,000 to John?")
- **Context Awareness**  
  Remembers previous field values during multi-step forms
- **Privacy Focused**  
  No payment processing - works with your existing backend

## 🛠️ Tech Stack

**Frontend**  
- Next.js 15 (App Router)  
- Tailwind CSS + ShadCN UI  
- Web Speech API  

**AI Service**  
- OpenAI GPT-4 (Field extraction)  

**Utility**  
- Zod (Form validation)  
- Redis (Request Caching & Rate limiting)  

## 🚀 Setup (Next.js)

1. **Clone repository**
   ```bash
   git clone https://github.com/MindInitiatives/VoxForm.git