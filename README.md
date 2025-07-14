# 🌄 Tripify AI – Offline AI Travel Assistant

> **Your AI Travel Guide That Works Without Internet.**

Tripify AI is a travel companion powered by on-device AI models and retrieval-augmented generation (RAG), designed specifically for remote locations where connectivity is unreliable or nonexistent. Whether you're exploring Leh-Ladakh or any off-the-grid region, Tripify AI provides intelligent assistance, itinerary discovery, and navigation — completely offline.

---

## 🚀 Features

* 🧠 **On-Device AI Chatbot** – Powered by Phi-3 Mini ONNX for fast and efficient local inference.
* 📆 **Modular Data Packages** – Download destination-specific RAG datasets (e.g., Leh-Ladakh) as needed.
* 🧱 **Map Navigation** – Offline maps with smart route suggestions and landmarks.
* 📍 **Nearby Itinerary Finder** – Discover activities, stays, and hidden spots around you.
* 🔌 **Offline-First Design** – Works entirely without the internet once setup is complete.
* 🎯 **Lightweight & Mobile-Optimized** – Built using React Native + Expo for cross-platform support.

---

## 📱 How It Works

1. **Install the App**
   Users download the base Tripify AI app from the App Store or Play Store.

2. **Download AI + Destination Package**
   On first launch, users are prompted to download:

   * The Phi-3 Mini model (ONNX format)
   * A selected destination data pack (e.g., Leh-Ladakh JSON files for RAG)

3. **Start Exploring Offline**
   The AI chatbot becomes your interactive guide – answering queries, recommending nearby spots, and assisting with routes – all without an internet connection.

---

## 🧠 Technology Stack

* **Frontend:** React Native (Expo), Tailwind CSS
* **AI Engine:** Phi-3 Mini ONNX (on-device inference)
* **RAG System:** Local JSON document search & retrieval
* **Navigation:** Offline map integration (e.g., MapLibre / OpenStreetMap)
* **Deployment:** Netlify (Prototype frontend), GitHub, APK (soon)

---

## 🛠️ Local Setup

```bash
git clone https://github.com/amritesh-0/tripify-ai.git
cd tripify-ai
npm install
npx expo start
```

# ▶️ To run directly on a device or simulator:

```bash
npx expo run:ios   # Run on iOS simulator or device (Mac only)
npx expo run:android   # Run on Android emulator or device
```

> These commands build and launch the native app on your connected device or simulator. Make sure you have Xcode (for iOS) or Android Studio (for Android) installed and set up. See [Expo CLI docs](https://docs.expo.dev/workflow/expo-cli/) for more details.

> Ensure you have [Expo CLI](https://docs.expo.dev/get-started/installation/) installed.

---

## 📦 Folder Structure

```
tripify-ai/
├── app/                  # Screens and routes
├── assets/               # Images and icons
├── components/           # UI components
├── data/                 # Destination-specific RAG files
├── models/               # ONNX AI models
├── utils/                # Utility functions (tokenizer, RAG logic)
└── README.md
```

---

## 📸 Prototype Demo

📺 [Watch on YouTube](https://www.youtube.com/shorts/OGid85mwesQ)

---

## ✨ Roadmap

* [x] Frontend Design & Navigation
* [x] Onboarding + Model Package Download Flow
* [x] ONNX Phi-3 Integration
* [x] JSON-based RAG Querying
* [ ] Offline Maps Integration
* [ ] Multi-Destination Support
* [ ] Native APK Release

---

## 🤝 Contributing

We welcome contributions from open-source developers passionate about AI and travel tech.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/your-feature
# Commit your changes
git commit -m "Add feature"
# Push to the branch
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📬 Contact

For queries, collaborations, or early access:

* 📧 Email: [amriteshkr0815@gmail.com](mailto:amriteshkr0815@gmail.com)
* 🌐 Website: [tripify-ai](https://tripify-ai.netlify.app/)

---

## 📄 License

MIT License. See `LICENSE` for details.

---

> Built with ❤️ by [Amritesh Kumar](https://github.com/amritesh-0) and the Tripify AI team - Nishtha Pandey and Nitu Dudi. 