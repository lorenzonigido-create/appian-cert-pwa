# Appian Cert PWA

PWA mobile-first per lo studio della certificazione **Appian ACD100 (Certified Associate Developer)**.

## Caratteristiche

- 📚 **8 capitoli** con lezioni, quiz e flashcard per ogni argomento ACD100
- 🎯 **112 domande** nel banco esame (incluse domande reali condivise dai candidati)
- 🏆 **Simulatore d'esame** — 60 domande casuali, 60 minuti, soglia 62% (formato ufficiale ACD100)
- 👥 **Tab SHARE** — aggiungi domande che ricordi dall'esame reale
- 🤖 **AI Tutor** — knowledge base locale offline + API Anthropic opzionale
- 📱 **Installabile** come PWA su iOS/Android/Desktop

---

## Avvio in locale

### Opzione 1 — Apertura diretta (più semplice)

Scarica `appian-cert-pwa.html` e aprilo nel browser con doppio click.  
Funziona completamente offline, nessun server necessario.

### Opzione 2 — Server locale con Node.js (consigliato per PWA)

```bash
git clone https://github.com/lorenzonigido-create/appian-cert-pwa.git
cd appian-cert-pwa
npm start
```

Poi apri: [http://localhost:3456/appian-cert-pwa.html](http://localhost:3456/appian-cert-pwa.html)

> `npm start` usa `npx serve` — nessun `npm install` necessario.

### Opzione 3 — Live reload durante lo sviluppo

```bash
npm run dev
```

Apre automaticamente il browser e ricarica ad ogni salvataggio.

### Opzione 4 — Python (se non hai Node)

```bash
python -m http.server 3456
```

Poi apri: [http://localhost:3456/appian-cert-pwa.html](http://localhost:3456/appian-cert-pwa.html)

---

## Test automatici (Playwright)

```bash
npm test
```

Esegue 29 check headless su tutti i tab dell'app (richiede Playwright installato).

---

## Struttura

```
appian-cert-pwa.html   # App completa (single-file PWA)
package.json           # Script npm start / dev / test
verify.js              # Suite test Playwright (29 check)
screenshots/           # Screenshot generati dai test
appian-cert-app.jsx    # Bozza React originale (riferimento)
```

---

## Certificazione ACD100

- **60 domande** a risposta multipla
- **60 minuti** di tempo
- **Soglia di superamento**: 62%
- Argomenti: Process Modeling, Expression Rules, Interfaces, Data, Sites, Reports, Integrations, AI/RPA
