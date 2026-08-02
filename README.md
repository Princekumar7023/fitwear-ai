# 👔 FitWear AI — AI Virtual Try-On App

Transform your wardrobe digitally with AI.

**FitWear AI** is a React Native + Expo application that allows users to virtually try on clothes using AI. Simply upload your photo, choose a clothing preset or upload your own garment reference image, and generate a realistic try-on result while preserving your identity, pose, lighting, and background.

> ⚠️ **Current Status:** Active Development / Testing

---

# ✨ Features

- 👤 AI-powered virtual try-on
- 📸 Upload your own photo
- 👕 Clothing preset library
- 🖼️ Custom clothing image upload
- 🎯 Identity preservation
- 🌄 Background preservation
- 📱 Android APK builds using Expo EAS
- ⚡ Modern React Native UI
- 🔄 Swappable AI backend architecture

---

# 📸 Screenshots

> *(Add screenshots here)*

```
Home Screen
Wardrobe Selection
Try-On Screen
Generated Result
```

---

# 🏗 Tech Stack

### Mobile

- React Native
- Expo SDK 57
- Expo Router
- TypeScript

### Backend

- Expo Router API Routes (development)
- Hugging Face CatVTON (testing)
- Easily replaceable with Gemini, Replicate, Fal.ai, etc.

### Build & Deployment

- Expo EAS Build
- Android APK
- GitHub

---

# 📂 Project Structure

```
src/
│
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   └── try-on.tsx
│   │
│   ├── api/
│   │   └── wardrobe+api.ts
│   │
│   └── result.tsx
│
├── components/
├── constants/
├── data/
├── hooks/
├── types/
│
└── assets/
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Princekumar7023/fitwear-ai.git

cd fitwear-ai
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create

```
.env.local
```

Example

```env
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Get your token from:

https://huggingface.co/settings/tokens

> Never commit `.env.local` to GitHub.

---

## 4. Start Development Server

```bash
npx expo start
```

Run using

- Android Emulator
- Development Build
- Expo Go
- iOS Simulator

---

# 🤖 AI Backend

The current implementation uses

**Hugging Face CatVTON**

for image generation.

Current backend:

```
React Native
      │
      ▼
Expo API Route
      │
      ▼
CatVTON
```

The backend implementation is located in

```
src/app/api/wardrobe+api.ts
```

The request and response interfaces are shared inside

```
src/types/
```

making it easy to replace CatVTON with another provider later.

---

# ⚠️ Important Architecture Note

Expo Router API Routes **do not execute inside standalone Android APKs.**

They work when running locally or after deployment to a Node.js environment.

If the mobile app directly calls

```
/api/wardrobe
```

inside a standalone APK, it will fail with

```
Invalid URL: /api/wardrobe
```

For production, deploy the backend separately (e.g. Vercel, Render, Railway) and configure the mobile app to call

```
https://your-backend-domain.com/api/wardrobe
```

instead of

```
/api/wardrobe
```

---

# 🧪 Current Backend Status

The project currently uses the public

**Hugging Face CatVTON Space**

for testing purposes.

Current limitations:

- Public ZeroGPU Space
- Cold starts
- Queue delays
- Possible downtime
- Non-commercial license (CC BY-NC-SA 4.0)

Before releasing commercially, migrate to a production-ready provider such as

- Gemini Image API
- Fal.ai
- Replicate
- Self-hosted CatVTON

---

# 📦 Building APK

This project uses **Expo EAS Build**.

Configure EAS

```bash
eas login
```

Generate APK

```bash
eas build --platform android --profile preview
```

Generate Play Store Bundle

```bash
eas build --platform android --profile production
```

The preview profile produces an installable APK for testing.

---

# ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| HF_TOKEN | Hugging Face Access Token |

Future production:

| Variable | Description |
|----------|-------------|
| API_BASE_URL | Backend URL |
| GEMINI_API_KEY | Gemini API Key |

---

# 🧩 Future Improvements

- Clothing category detection
- Face consistency improvements
- Multiple outfit support
- Clothing recommendations
- User accounts
- Saved wardrobes
- History
- Cloud storage
- Faster AI backend
- Production API deployment

---

# 📝 Development Workflow

After making changes

```bash
git add .

git commit -m "Describe your changes"

git push
```

---

# 🧪 Testing

Run lint

```bash
npx expo lint
```

Run TypeScript

```bash
npx tsc --noEmit
```

Build APK

```bash
eas build --platform android --profile preview
```

---

# 📚 Useful Resources

Expo

https://docs.expo.dev/

Expo Router

https://docs.expo.dev/router/

EAS Build

https://docs.expo.dev/build/introduction/

React Native

https://reactnative.dev/

Hugging Face

https://huggingface.co/

---

# 📄 License

This repository contains the application source code only.

The current AI backend (CatVTON) is used strictly for development/testing and is subject to its own license:

**CC BY-NC-SA 4.0**

Commercial deployments should replace the current backend with an appropriately licensed production provider.

---

# 👨‍💻 Author

**Prince Kumar**

GitHub

https://github.com/Princekumar7023

---

⭐ If you found this project interesting, consider starring the repository.
