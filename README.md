# Appian Cert PWA

PWA mobile-first per lo studio della certificazione **Appian ACD100 (Certified Associate Developer)**.

## Caratteristiche

- 📚 **10 capitoli** con lezioni e quiz per ogni argomento ACD100
- 🎯 **Obiettivi giornalieri** con streak e gamification (XP, badge, livelli)
- ⚡ **Flashcard mode** per ripasso rapido
- 🧪 **Simulatore d'esame** — 60 domande casuali, 60 minuti, soglia 62% (regole ufficiali ACD100)
- 🤖 **AI Tutor** — knowledge base locale offline + API Anthropic opzionale
- 📱 **Installabile** come PWA su iOS/Android/Desktop

## Utilizzo

Apri `appian-cert-pwa.html` direttamente nel browser, oppure avvia un server locale:

```bash
python -m http.server 3456
```

Poi visita `http://localhost:3456/appian-cert-pwa.html`

## Struttura

```
appian-cert-pwa.html   # App completa (single-file PWA)
appian-cert-app.jsx    # Bozza React originale (riferimento)
```

## Certificazione ACD100

- **60 domande** a risposta multipla
- **60 minuti** di tempo
- **Soglia di superamento**: 62%
- Argomenti: Process Modeling, Expression Rules, Interfaces, Data, Sites, Reports, Integrations, AI/RPA
