import { useState, useEffect, useRef } from "react";

// ─── PALETTE & FONTS ────────────────────────────────────────────────────────
// Dark-tech aesthetic: deep navy bg, Appian-orange accent, monospaced accents
// Fonts: "Space Mono" for code/labels, "DM Serif Display" for titles, "DM Sans" for body

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0b0f1a;
    --bg2:       #111827;
    --bg3:       #1a2235;
    --border:    #1f2d45;
    --accent:    #f97316;
    --accent2:   #fb923c;
    --blue:      #3b82f6;
    --green:     #22c55e;
    --red:       #ef4444;
    --yellow:    #eab308;
    --text:      #e2e8f0;
    --muted:     #64748b;
    --mono:      'Space Mono', monospace;
    --serif:     'DM Serif Display', serif;
    --sans:      'DM Sans', sans-serif;
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--sans); }

  /* Mobile frame */
  .phone-shell {
    max-width: 420px; margin: 0 auto; min-height: 100vh;
    display: flex; flex-direction: column; background: var(--bg); position: relative; overflow: hidden;
  }

  /* Header */
  .header {
    padding: 16px 20px 12px; background: var(--bg2);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .header-logo { font-family: var(--mono); font-size: 13px; color: var(--accent); letter-spacing: 2px; }
  .header-title { font-family: var(--serif); font-size: 18px; color: var(--text); }
  .header-xp { font-family: var(--mono); font-size: 11px; color: var(--accent); background: rgba(249,115,22,.15); padding: 4px 10px; border-radius: 20px; }

  /* Nav bar */
  .nav-bar {
    position: sticky; bottom: 0; z-index: 100;
    background: var(--bg2); border-top: 1px solid var(--border);
    display: flex; justify-content: space-around; padding: 8px 0 12px;
  }
  .nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    font-family: var(--mono); font-size: 9px; color: var(--muted);
    background: none; border: none; cursor: pointer; padding: 6px 12px;
    transition: color .2s;
  }
  .nav-btn.active { color: var(--accent); }
  .nav-btn svg { width: 20px; height: 20px; }

  /* Scrollable content */
  .content { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }

  /* Cards */
  .card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 16px;
    padding: 18px; transition: transform .15s, border-color .2s;
  }
  .card:active { transform: scale(.98); }
  .card.accent-border { border-color: var(--accent); }
  .card.blue-border { border-color: var(--blue); }
  .card.green-border { border-color: var(--green); }

  /* Buttons */
  .btn {
    font-family: var(--mono); font-size: 12px; letter-spacing: 1px;
    border: none; border-radius: 12px; padding: 12px 24px;
    cursor: pointer; transition: all .2s; width: 100%; font-weight: 700;
  }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
  .btn-outline { background: transparent; color: var(--accent); border: 1.5px solid var(--accent); }
  .btn-secondary { background: var(--bg3); color: var(--text); border: 1px solid var(--border); }
  .btn-green { background: var(--green); color: #000; }
  .btn-blue { background: var(--blue); color: #fff; }

  /* Progress bar */
  .prog-track { background: var(--bg3); border-radius: 99px; height: 6px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width .6s ease; }

  /* Tags */
  .tag { display: inline-block; font-family: var(--mono); font-size: 9px; letter-spacing: 1px; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
  .tag-orange { background: rgba(249,115,22,.18); color: var(--accent); }
  .tag-blue { background: rgba(59,130,246,.18); color: var(--blue); }
  .tag-green { background: rgba(34,197,94,.18); color: var(--green); }
  .tag-red { background: rgba(239,68,68,.18); color: var(--red); }
  .tag-muted { background: var(--bg3); color: var(--muted); }

  /* Quiz options */
  .quiz-option {
    background: var(--bg3); border: 1.5px solid var(--border); border-radius: 12px;
    padding: 14px 16px; cursor: pointer; margin-bottom: 10px;
    font-size: 14px; color: var(--text); transition: all .2s; text-align: left; width: 100%;
    font-family: var(--sans);
  }
  .quiz-option:hover { border-color: var(--accent); }
  .quiz-option.correct { border-color: var(--green); background: rgba(34,197,94,.12); color: var(--green); }
  .quiz-option.wrong { border-color: var(--red); background: rgba(239,68,68,.12); color: var(--red); }
  .quiz-option.selected { border-color: var(--blue); background: rgba(59,130,246,.12); }

  /* Roadmap */
  .roadmap-step {
    display: flex; gap: 14px; align-items: flex-start; position: relative;
  }
  .step-line-wrap { display: flex; flex-direction: column; align-items: center; }
  .step-dot {
    width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 12px; font-weight: 700; flex-shrink: 0;
    border: 2px solid var(--border); background: var(--bg3);
  }
  .step-dot.done { background: var(--green); border-color: var(--green); color: #000; }
  .step-dot.active { background: var(--accent); border-color: var(--accent); color: #000; }
  .step-dot.locked { color: var(--muted); }
  .step-connector { width: 2px; flex: 1; min-height: 20px; background: var(--border); margin: 4px 0; }
  .step-connector.done { background: var(--green); }

  /* Concept map */
  .cmap-node {
    background: var(--bg3); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 12px; font-size: 12px; font-family: var(--mono); color: var(--accent);
    text-align: center; cursor: default;
  }
  .cmap-center {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #000; font-weight: 700; border-radius: 14px; padding: 12px 16px;
    text-align: center; font-family: var(--mono); font-size: 13px;
  }

  /* Stat boxes */
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-box { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }
  .stat-num { font-family: var(--serif); font-size: 32px; color: var(--accent); line-height: 1; }
  .stat-label { font-family: var(--mono); font-size: 9px; color: var(--muted); margin-top: 4px; letter-spacing: 1px; }

  /* Lesson content */
  .lesson-body { font-size: 14px; line-height: 1.75; color: #cbd5e1; }
  .lesson-body h4 { font-family: var(--serif); font-size: 18px; color: var(--text); margin: 18px 0 8px; }
  .lesson-body p { margin-bottom: 12px; }
  .lesson-body ul { padding-left: 18px; margin-bottom: 12px; }
  .lesson-body li { margin-bottom: 6px; }
  .lesson-body code { font-family: var(--mono); font-size: 12px; background: var(--bg3); padding: 2px 6px; border-radius: 4px; color: var(--accent); }

  /* Animations */
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .fade-up { animation: fadeUp .35s ease; }
  .pop { animation: pop .3s ease; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Badge */
  .badge { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; }

  /* Alert */
  .alert { border-radius: 10px; padding: 12px 16px; font-size: 13px; margin-bottom: 8px; }
  .alert-green { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.3); color: var(--green); }
  .alert-red { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--red); }
  .alert-blue { background: rgba(59,130,246,.12); border: 1px solid rgba(59,130,246,.3); color: var(--blue); }

  /* Exam timer */
  .timer-ring { font-family: var(--mono); font-size: 28px; font-weight: 700; color: var(--accent); }
  .timer-ring.danger { color: var(--red); animation: pulse 1s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

  /* Modal overlay */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal-box { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 28px; max-width: 400px; width: 100%; }

  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .flex-row { display: flex; align-items: center; gap: 10px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
`;

// ─── DATA ───────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    id: 1, title: "Fondamenti di Appian", emoji: "🏗️",
    tag: "Fondamenti", xp: 150,
    lessons: [
      {
        id: "1.1", title: "Cos'è Appian?", duration: "8 min",
        content: `
<h4>Piattaforma Low-Code Enterprise</h4>
<p>Appian è una piattaforma <code>low-code</code> per la creazione rapida di applicazioni enterprise. Combina Process Mining, Workflow Automation, RPA e AI in un unico ambiente.</p>
<h4>Componenti Chiave</h4>
<ul>
  <li><strong>Process Modeler</strong>: disegno visuale dei processi BPMN</li>
  <li><strong>Records</strong>: gestione dati con interfacce auto-generate</li>
  <li><strong>Sites</strong>: portali web multi-pagina</li>
  <li><strong>Integrations</strong>: connessioni REST/SOAP/DB</li>
</ul>
<h4>Architettura Cloud</h4>
<p>Appian Cloud è basata su AWS e garantisce SLA del 99.9%. Supporta deployment <code>on-premise</code>, cloud e ibrido.</p>
        `,
        quiz: [
          { q: "Quale tecnologia di cloud usa Appian Cloud?", opts: ["Azure","AWS","GCP","IBM Cloud"], ans: 1 },
          { q: "Cosa sono i 'Records' in Appian?", opts: ["File di log","Gestione dati con UI auto-generate","Template email","Connettori DB"], ans: 1 },
          { q: "Lo SLA di Appian Cloud è pari a:", opts: ["99.0%","99.5%","99.9%","100%"], ans: 2 },
        ]
      },
      {
        id: "1.2", title: "Appian Designer", duration: "10 min",
        content: `
<h4>Appian Designer – L'ambiente di sviluppo</h4>
<p>Appian Designer è l'IDE web-based dove si sviluppano tutte le applicazioni. Accessibile da browser, non richiede installazioni locali.</p>
<h4>Pannelli Principali</h4>
<ul>
  <li><strong>Build</strong>: creazione di oggetti (process, record, interface, ecc.)</li>
  <li><strong>Monitor</strong>: monitoraggio processi in esecuzione</li>
  <li><strong>Deploy</strong>: gestione dei package di rilascio</li>
  <li><strong>Governance</strong>: sicurezza e gestione utenti</li>
</ul>
<h4>Oggetti Fondamentali</h4>
<p>In Appian tutto è un <code>Object</code>. Gli oggetti principali sono: Process Model, Interface, Record, Integration, Expression Rule, Decision, Constant, Group, User.</p>
        `,
        quiz: [
          { q: "Dove si sviluppano le applicazioni Appian?", opts: ["Eclipse IDE","Appian Designer (browser)","Visual Studio Code","IntelliJ"], ans: 1 },
          { q: "Quale sezione di Designer mostra i processi in esecuzione?", opts: ["Build","Deploy","Monitor","Governance"], ans: 2 },
          { q: "Come si chiamano gli elementi base di un'app Appian?", opts: ["Components","Objects","Modules","Services"], ans: 1 },
        ]
      },
      {
        id: "1.3", title: "Applicazioni e Package", duration: "7 min",
        content: `
<h4>Struttura di un'Applicazione</h4>
<p>Un'<strong>Application</strong> in Appian è un contenitore logico che raggruppa tutti gli oggetti correlati. Permette di gestire versioning e deployment in modo unitario.</p>
<h4>Package di Deploy</h4>
<p>Il <code>Package</code> è il meccanismo di trasporto tra ambienti (DEV → TEST → PROD). Può contenere oggetti selezionati o l'intera applicazione.</p>
<h4>Best Practices</h4>
<ul>
  <li>Usare prefissi consistenti per gli oggetti (es. <code>APP_</code>)</li>
  <li>Separare le Constant per ambiente</li>
  <li>Includere le dipendenze nel package</li>
</ul>
        `,
        quiz: [
          { q: "Cos'è un Package in Appian?", opts: ["Un componente UI","Il meccanismo di trasporto tra ambienti","Un tipo di processo","Un record type"], ans: 1 },
          { q: "Qual è il flusso tipico di deployment?", opts: ["PROD→TEST→DEV","DEV→TEST→PROD","TEST→DEV→PROD","DEV→PROD"], ans: 1 },
          { q: "Cosa si consiglia per nominare gli oggetti?", opts: ["Nomi casuali","Prefissi consistenti","Solo numeri","Nomi in maiuscolo"], ans: 1 },
        ]
      },
    ],
    chapterQuiz: [
      { q: "Appian è classificata come piattaforma:", opts: ["No-code","Low-code","High-code","BPM tradizionale"], ans: 1 },
      { q: "Quale componente permette il disegno visuale BPMN?", opts: ["Record","Process Modeler","Site","Integration"], ans: 1 },
      { q: "Gli oggetti in Appian vengono raggruppati in:", opts: ["Moduli","Librerie","Applicazioni","Namespace"], ans: 2 },
      { q: "Appian Designer richiede:", opts: ["Java installato","Un IDE locale","Solo un browser web","Node.js"], ans: 2 },
      { q: "Il deployment tra ambienti avviene tramite:", opts: ["FTP","Package","Git push","ZIP manuale"], ans: 1 },
    ],
    conceptMap: {
      center: "APPIAN PLATFORM",
      nodes: ["Process Modeler","Records","Sites","Integrations","AI/RPA","Appian Designer","Cloud AWS","Low-Code"]
    },
    summary: "Appian è una piattaforma low-code enterprise che unisce BPM, AI e RPA. Lo sviluppo avviene interamente nel browser via Appian Designer. Le app sono composte da Objects raggruppati in Applications, distribuiti tra ambienti tramite Package."
  },
  {
    id: 2, title: "Process Models", emoji: "⚙️",
    tag: "Processi", xp: 200,
    lessons: [
      {
        id: "2.1", title: "Anatomia di un Process Model", duration: "12 min",
        content: `
<h4>Cos'è un Process Model</h4>
<p>Il <strong>Process Model</strong> è il cuore di Appian. Definisce il flusso di lavoro aziendale usando una notazione derivata dal BPMN con estensioni proprietarie.</p>
<h4>Nodi Principali</h4>
<ul>
  <li><code>Start Event</code> / <code>End Event</code>: inizio e fine processo</li>
  <li><code>User Input Task</code>: task assegnato a un utente con form</li>
  <li><code>Script Task</code>: esecuzione di logica expression rule</li>
  <li><code>Service Task</code>: chiamata a integration/plugin</li>
  <li><code>Gateway</code>: biforcazione del flusso (XOR, AND)</li>
  <li><code>Sub-Process</code>: processo annidato</li>
</ul>
<h4>Process Variables</h4>
<p>Le <code>pv!</code> (Process Variables) memorizzano i dati del processo durante l'esecuzione. Tipizzate e configurabili come input/output.</p>
        `,
        quiz: [
          { q: "Cosa rappresenta un 'User Input Task'?", opts: ["Chiamata API","Task con form assegnato a utente","Script automatico","Gateway"], ans: 1 },
          { q: "Come si accede alle variabili di processo?", opts: ["var!","pv!","local!","ri!"], ans: 1 },
          { q: "Quale nodo divide il flusso in rami paralleli?", opts: ["XOR Gateway","Start Event","AND Gateway","Sub-Process"], ans: 2 },
        ]
      },
      {
        id: "2.2", title: "Gateway e Flusso Condizionale", duration: "10 min",
        content: `
<h4>Tipi di Gateway</h4>
<p>I gateway controllano il routing del processo:</p>
<ul>
  <li><strong>XOR Gateway</strong> (esclusivo): un solo ramo viene percorso</li>
  <li><strong>AND Gateway</strong> (parallelo): tutti i rami vengono percorsi simultaneamente</li>
  <li><strong>OR Gateway</strong> (inclusivo): uno o più rami in base alle condizioni</li>
</ul>
<h4>Condizioni sui Flow</h4>
<p>Ogni arco uscente da un gateway ha una <code>condition expression</code> in linguaggio Appian Expression. Es: <code>pv!status = "APPROVED"</code></p>
<h4>Default Flow</h4>
<p>È buona pratica definire sempre un <code>default flow</code> sul gateway XOR per evitare processi bloccati.</p>
        `,
        quiz: [
          { q: "Il gateway XOR fa percorrere:", opts: ["Tutti i rami","Un solo ramo","Nessun ramo","Rami randomici"], ans: 1 },
          { q: "La condizione su un arco è scritta in:", opts: ["JavaScript","SQL","Appian Expression","Python"], ans: 2 },
          { q: "Cosa si consiglia sempre su un XOR gateway?", opts: ["Un AND gateway successivo","Un default flow","Nessuna condizione","Un Sub-Process"], ans: 1 },
        ]
      },
      {
        id: "2.3", title: "Gestione Eccezioni e Timer", duration: "9 min",
        content: `
<h4>Boundary Events</h4>
<p>I <strong>Boundary Events</strong> si attaccano ai task e gestiscono eventi eccezionali durante l'esecuzione:</p>
<ul>
  <li><code>Timer Boundary Event</code>: scatta dopo un tempo definito</li>
  <li><code>Error Boundary Event</code>: cattura errori del task</li>
  <li><code>Signal Boundary Event</code>: risponde a segnali esterni</li>
</ul>
<h4>Error Handling</h4>
<p>Gli errori non gestiti terminano il processo in stato <code>CANCELLED</code>. Si usa il nodo <code>Exception Handler</code> o boundary events per una gestione robusta.</p>
<h4>Escalation con Timer</h4>
<p>Pattern comune: Timer Boundary Event su User Task → notifica di sollecito se non completato entro X ore.</p>
        `,
        quiz: [
          { q: "Cosa fa un Timer Boundary Event?", opts: ["Blocca il processo","Scatta dopo un tempo definito","Invia email","Crea una task manuale"], ans: 1 },
          { q: "Un processo con errore non gestito termina in stato:", opts: ["COMPLETED","ERROR","CANCELLED","PAUSED"], ans: 2 },
          { q: "Il pattern Timer + notifica serve per:", opts: ["Ottimizzare DB","Escalation/solleciti","Split parallelo","Audit trail"], ans: 1 },
        ]
      },
    ],
    chapterQuiz: [
      { q: "Le Process Variables usano il prefisso:", opts: ["var!","local!","pv!","rule!"], ans: 2 },
      { q: "Quale gateway esegue tutti i rami contemporaneamente?", opts: ["XOR","OR","AND","SPLIT"], ans: 2 },
      { q: "Un User Input Task richiede:", opts: ["Solo codice","Un form (Interface) e assegnatario","Un DB query","Una Integration"], ans: 1 },
      { q: "I Boundary Events si applicano a:", opts: ["Gateway","Sequence flows","Task","Process Variables"], ans: 2 },
      { q: "Il 'default flow' è consigliato su:", opts: ["AND Gateway","Start Event","XOR Gateway","Sub-Process"], ans: 2 },
    ],
    conceptMap: {
      center: "PROCESS MODEL",
      nodes: ["Start/End Event","User Input Task","Script Task","Gateway XOR/AND","Boundary Events","Process Variables pv!","Sub-Process","Exception Handler"]
    },
    summary: "I Process Models definiscono i workflow aziendali. I nodi principali sono User Task, Script Task, Service Task e Gateway. Le pv! memorizzano i dati. I Boundary Events gestiscono eccezioni e timer. Fondamentale: XOR ha sempre un default flow."
  },
  {
    id: 3, title: "Interfaces & SAIL", emoji: "🎨",
    tag: "UI/UX", xp: 180,
    lessons: [
      {
        id: "3.1", title: "SAIL e Component Framework", duration: "11 min",
        content: `
<h4>Cos'è SAIL</h4>
<p><strong>SAIL</strong> (Self-Assembling Interface Layer) è il framework UI di Appian. Le interfacce vengono definite tramite <code>Expression Language</code> e si adattano automaticamente a desktop e mobile.</p>
<h4>Componenti Fondamentali</h4>
<ul>
  <li><code>a!formLayout()</code>: layout principale dei form</li>
  <li><code>a!textField()</code>: campo testo</li>
  <li><code>a!dropdownField()</code>: selezione da lista</li>
  <li><code>a!gridField()</code>: griglia dati tabellare</li>
  <li><code>a!buttonLayout()</code>: pulsanti azione</li>
  <li><code>a!sectionLayout()</code>: raggruppamento sezioni</li>
</ul>
<h4>Local Variables</h4>
<p>Nelle interface si usano le <code>local!</code> per stato temporaneo e <code>ri!</code> (Rule Inputs) per i dati passati dall'esterno.</p>
        `,
        quiz: [
          { q: "SAIL sta per:", opts: ["System Application Integration Layer","Self-Assembling Interface Layer","Scalable AI Logic","Simple App Interface Language"], ans: 1 },
          { q: "Quale funzione crea il layout principale di un form?", opts: ["a!sectionLayout()","a!formLayout()","a!gridField()","a!columnLayout()"], ans: 1 },
          { q: "I dati passati dall'esterno a un'interface usano il prefisso:", opts: ["pv!","local!","ri!","var!"], ans: 2 },
        ]
      },
      {
        id: "3.2", title: "Validazioni e Visibilità Dinamica", duration: "9 min",
        content: `
<h4>Validazioni</h4>
<p>La validazione avviene tramite il parametro <code>validations</code> dei componenti o con <code>a!validationMessage()</code>:</p>
<ul>
  <li>Validazione inline: direttamente nel componente</li>
  <li>Validazione form-level: su <code>a!formLayout()</code></li>
  <li>Server-side: via Expression Rule richiamata all'invio</li>
</ul>
<h4>Visibilità Condizionale</h4>
<p>Il parametro <code>showWhen</code> permette di mostrare/nascondere componenti dinamicamente:<br><code>showWhen: local!tipo = "URGENTE"</code></p>
<h4>Refresh Variables</h4>
<p><code>a!refreshVariable()</code> aggiorna automaticamente dati quando cambiano i valori dipendenti, senza ricaricare l'intera pagina.</p>
        `,
        quiz: [
          { q: "Il parametro per la visibilità condizionale è:", opts: ["hideWhen","visible","showWhen","displayIf"], ans: 2 },
          { q: "a!refreshVariable() serve a:", opts: ["Ricaricare la pagina","Aggiornare dati dinamicamente","Validare un campo","Salvare nel DB"], ans: 1 },
          { q: "La validazione server-side avviene:", opts: ["In real-time","All'invio del form","Al caricamento","Mai"], ans: 1 },
        ]
      },
      {
        id: "3.3", title: "Grid e Record List", duration: "10 min",
        content: `
<h4>a!gridField()</h4>
<p>Il componente griglia mostra dati tabulari con supporto a paginazione, ordinamento e selezione righe. Fondamentale per le liste di record.</p>
<h4>Linked Records</h4>
<p>Con <code>a!linkField()</code> e <code>a!recordLink()</code> si navigano i record direttamente dalla griglia. Ogni riga può aprire il dettaglio del record.</p>
<h4>Inline Editing</h4>
<p>La griglia supporta l'editing inline delle celle tramite il parametro <code>rowHeader</code> e componenti editabili nelle colonne. Permette modifiche senza uscire dalla lista.</p>
        `,
        quiz: [
          { q: "Quale componente mostra dati tabulari con paginazione?", opts: ["a!textField()","a!sectionLayout()","a!gridField()","a!listField()"], ans: 2 },
          { q: "Per navigare ai dettagli di un record da una griglia si usa:", opts: ["a!textLink()","a!recordLink()","a!urlLink()","a!navigate()"], ans: 1 },
          { q: "L'editing inline in a!gridField() permette di:", opts: ["Esportare CSV","Modificare celle senza uscire dalla lista","Filtrare colonne","Stampare"], ans: 1 },
        ]
      },
    ],
    chapterQuiz: [
      { q: "SAIL si adatta automaticamente a:", opts: ["Solo desktop","Solo mobile","Desktop e mobile","Solo tablet"], ans: 2 },
      { q: "Le variabili locali in un'interface usano:", opts: ["pv!","local!","ri!","var!"], ans: 1 },
      { q: "Il parametro 'showWhen' gestisce:", opts: ["La validazione","La visibilità condizionale","Il colore","L'ordinamento"], ans: 1 },
      { q: "a!refreshVariable() aggiorna i dati:", opts: ["Al click manuale","Automaticamente al cambio dipendenze","Ogni 5 secondi","Al submit"], ans: 1 },
      { q: "a!recordLink() si usa per:", opts: ["Link esterni","Navigare ai record da griglia","Upload file","Invio email"], ans: 1 },
    ],
    conceptMap: {
      center: "SAIL INTERFACES",
      nodes: ["a!formLayout()","local! variables","ri! Rule Inputs","showWhen","a!gridField()","a!refreshVariable()","Validations","a!recordLink()"]
    },
    summary: "SAIL è il framework UI responsive di Appian basato su Expression Language. Le interface usano local! per stato interno e ri! per input esterni. La visibilità è controllata da showWhen. Le griglie supportano paginazione, ordinamento ed editing inline."
  },
  {
    id: 4, title: "Records & Data", emoji: "🗄️",
    tag: "Dati", xp: 220,
    lessons: [
      {
        id: "4.1", title: "Record Types", duration: "13 min",
        content: `
<h4>Cos'è un Record Type</h4>
<p>Il <strong>Record Type</strong> è l'astrazione dei dati in Appian. Rappresenta un'entità aziendale (es. Cliente, Ordine) con dati, relazioni e sicurezza configurabili.</p>
<h4>Data Sources</h4>
<ul>
  <li><code>Database Table</code>: tabella DB relazionale (MySQL, Oracle, SQL Server)</li>
  <li><code>Process Model</code>: dati da istanze di processo</li>
  <li><code>Web Service</code>: dati da API esterne via Integration</li>
  <li><code>Salesforce</code>: connettore nativo Salesforce</li>
</ul>
<h4>Auto-Generated Features</h4>
<p>Creato un Record Type, Appian genera automaticamente: List View, Summary View, filtri, actions e security. Il developer può personalizzare ogni componente.</p>
        `,
        quiz: [
          { q: "Quale NON è una sorgente dati per un Record Type?", opts: ["Database Table","Process Model","Excel File","Web Service"], ans: 2 },
          { q: "Cosa viene generato automaticamente con un Record Type?", opts: ["Solo il form","List View, Summary View, filtri, actions","Solo il DB","Solo le API"], ans: 1 },
          { q: "Un Record Type rappresenta:", opts: ["Un file di log","Un'entità aziendale","Un processo","Un utente"], ans: 1 },
        ]
      },
      {
        id: "4.2", title: "Expression Rules e Queries", duration: "11 min",
        content: `
<h4>Expression Rules</h4>
<p>Le <strong>Expression Rules</strong> sono funzioni riutilizzabili scritte in Appian Expression Language. Accettano input (ri!) e restituiscono un valore calcolato.</p>
<h4>Query Records</h4>
<p>La funzione <code>a!queryRecordType()</code> interroga i record con filtri, ordinamento e paginazione:</p>
<ul>
  <li><code>filters</code>: condizioni di filtraggio</li>
  <li><code>pagingInfo</code>: paginazione e sorting</li>
  <li><code>fields</code>: campi da restituire</li>
</ul>
<h4>Aggregate Queries</h4>
<p>Con <code>a!queryAggregation()</code> si eseguono calcoli aggregati: COUNT, SUM, AVG, MAX, MIN sui record.</p>
        `,
        quiz: [
          { q: "Le Expression Rules accettano input tramite:", opts: ["pv!","local!","ri!","var!"], ans: 2 },
          { q: "Quale funzione interroga i Record Types?", opts: ["a!queryEntity()","a!queryRecordType()","a!getRecords()","a!fetchData()"], ans: 1 },
          { q: "a!queryAggregation() serve a:", opts: ["Creare record","Calcoli aggregati (COUNT, SUM...)","Aggiornare record","Eliminare record"], ans: 1 },
        ]
      },
      {
        id: "4.3", title: "Relazioni tra Record", duration: "8 min",
        content: `
<h4>One-to-Many e Many-to-One</h4>
<p>Appian supporta relazioni tra Record Types. Una relazione <code>One-to-Many</code> (es. Cliente → Ordini) si configura nel Record Type padre specificando il campo FK.</p>
<h4>Related Record Access</h4>
<p>Una volta definita la relazione, si accede ai dati correlati con la sintassi:<br><code>recordType!Customer.relationships.orders</code></p>
<h4>Joins nelle Query</h4>
<p>Le query possono attraversare le relazioni senza SQL manuale. Appian genera automaticamente i JOIN ottimizzati.</p>
        `,
        quiz: [
          { q: "Come si accede ai record correlati nelle query?", opts: ["Via SQL JOIN manuale","recordType!X.relationships.Y","a!join()","Tramite API esterna"], ans: 1 },
          { q: "In una relazione One-to-Many, il FK è nel record:", opts: ["Padre","Figlio","Entrambi","Nessuno"], ans: 1 },
          { q: "Appian genera i JOIN:", opts: ["Manualmente dallo sviluppatore","Automaticamente e ottimizzati","Solo per MySQL","Via stored procedure"], ans: 1 },
        ]
      },
    ],
    chapterQuiz: [
      { q: "Il Record Type connesso a Salesforce usa quale sorgente?", opts: ["Database Table","Process Model","Salesforce (nativo)","Web Service"], ans: 2 },
      { q: "a!queryRecordType() supporta:", opts: ["Solo filtri","Filtri, ordinamento e paginazione","Solo paginazione","Solo COUNT"], ans: 1 },
      { q: "Le Expression Rules sono:", opts: ["Funzioni riutilizzabili","Processi BPMN","Interfacce UI","Connettori DB"], ans: 0 },
      { q: "La relazione One-to-Many si configura nel Record Type:", opts: ["Figlio","Padre","In entrambi","Non si configura"], ans: 1 },
      { q: "I JOIN nelle relazioni Appian sono:", opts: ["Scritti a mano","Automatici e ottimizzati","Non supportati","Solo INNER JOIN"], ans: 1 },
    ],
    conceptMap: {
      center: "RECORDS & DATA",
      nodes: ["Record Type","DB Table","a!queryRecordType()","Expression Rules ri!","Relationships","a!queryAggregation()","Auto-Generated UI","Salesforce Connector"]
    },
    summary: "I Record Types sono l'astrazione dati di Appian. Supportano sorgenti DB, API, processi e Salesforce. Le Expression Rules (ri!) sono funzioni riutilizzabili. Le query usano a!queryRecordType() con filtri e paginazione. Le relazioni generano JOIN automatici."
  },
  {
    id: 5, title: "Integrations & Security", emoji: "🔐",
    tag: "Avanzato", xp: 250,
    lessons: [
      {
        id: "5.1", title: "Connected Systems e Integrations", duration: "12 min",
        content: `
<h4>Connected Systems</h4>
<p>Un <strong>Connected System</strong> centralizza la configurazione di connessione a un sistema esterno (URL base, autenticazione). Riutilizzabile da più Integration objects.</p>
<h4>Tipi di Integration</h4>
<ul>
  <li><code>REST Integration</code>: chiamate HTTP (GET, POST, PUT, DELETE)</li>
  <li><code>SOAP Integration</code>: web service WSDL</li>
  <li><code>Database Integration</code>: query SQL dirette</li>
  <li><code>OpenAPI Integration</code>: import spec OpenAPI/Swagger</li>
</ul>
<h4>Sicurezza delle Credenziali</h4>
<p>Le credenziali non vanno mai hardcoded! Si usano le <code>Credentials</code> nel Connected System con OAuth 2.0, API Key, o Basic Auth.</p>
        `,
        quiz: [
          { q: "Un Connected System centralizza:", opts: ["Il codice business","La configurazione di connessione","I Process Models","Le Interface SAIL"], ans: 1 },
          { q: "Per una REST API si usa:", opts: ["SOAP Integration","Database Integration","REST Integration","File Integration"], ans: 2 },
          { q: "Le credenziali devono essere:", opts: ["Hardcoded nel codice","Nel Connected System","In una Constant","In un Process Variable"], ans: 1 },
        ]
      },
      {
        id: "5.2", title: "Sicurezza e Permessi", duration: "10 min",
        content: `
<h4>Modello di Sicurezza Appian</h4>
<p>La sicurezza in Appian è basata su <strong>Groups</strong>. I permessi vengono assegnati a gruppi, non singoli utenti, per scalabilità.</p>
<h4>Livelli di Permesso</h4>
<ul>
  <li><code>Administrator</code>: accesso totale all'oggetto</li>
  <li><code>Editor</code>: modifica</li>
  <li><code>Initiator</code>: avvio processi</li>
  <li><code>Viewer</code>: sola lettura</li>
  <li><code>Deny</code>: accesso negato esplicito</li>
</ul>
<h4>Record-Level Security</h4>
<p>Per i Record Types si può definire sicurezza a livello di singolo record tramite <code>a!recordFilterList()</code> basato sull'identità dell'utente loggato (<code>loggedInUser()</code>).</p>
        `,
        quiz: [
          { q: "I permessi in Appian vengono assegnati a:", opts: ["Singoli utenti","Gruppi","Ruoli RBAC","Tutti gli utenti"], ans: 1 },
          { q: "Quale permesso consente solo di avviare processi?", opts: ["Viewer","Editor","Initiator","Administrator"], ans: 2 },
          { q: "La sicurezza a livello di singolo record usa:", opts: ["SQL WHERE","a!recordFilterList()","pv!security","Group membership"], ans: 1 },
        ]
      },
      {
        id: "5.3", title: "Robotic Process Automation (RPA)", duration: "9 min",
        content: `
<h4>Appian RPA</h4>
<p>Appian include RPA nativa (acquisita da Jidoka). I <strong>robotic processes</strong> automatizzano operazioni ripetitive su sistemi legacy senza API.</p>
<h4>Integrazione con Process Models</h4>
<p>Un robot RPA viene invocato da un processo tramite il nodo <code>Robotic Task</code>. Il risultato viene passato come output al processo chiamante.</p>
<h4>Robot Management</h4>
<p>Il <strong>Control Room</strong> di Appian gestisce: robot disponibili, scheduling, monitoraggio esecuzioni e gestione errori robot.</p>
        `,
        quiz: [
          { q: "Appian RPA è basata su quale prodotto acquisito?", opts: ["UiPath","Blue Prism","Jidoka","Automation Anywhere"], ans: 2 },
          { q: "Il nodo per invocare un robot da un processo è:", opts: ["Service Task","Robotic Task","Script Task","User Task"], ans: 1 },
          { q: "Il Control Room gestisce:", opts: ["Solo le Interface","Robot, scheduling e monitoraggio","I Process Models","I Record Types"], ans: 1 },
        ]
      },
    ],
    chapterQuiz: [
      { q: "Quale autenticazione è supportata nei Connected Systems?", opts: ["Solo Basic Auth","OAuth 2.0, API Key, Basic Auth","Solo OAuth","Solo API Key"], ans: 1 },
      { q: "Il permesso 'Deny' in Appian è:", opts: ["Implicito (default)","Esplicito","Non esiste","Eredita dal gruppo padre"], ans: 1 },
      { q: "L'importazione di una spec OpenAPI/Swagger crea automaticamente:", opts: ["Un Process Model","Un'Integration","Un Record Type","Un Site"], ans: 1 },
      { q: "loggedInUser() restituisce:", opts: ["Il nome dell'app","L'utente attualmente loggato","Il gruppo admin","Il server hostname"], ans: 1 },
      { q: "I robot RPA sono utili per:", opts: ["Sistemi con API moderne","Sistemi legacy senza API","Calcoli matematici","Generazione PDF"], ans: 1 },
    ],
    conceptMap: {
      center: "INTEGRATIONS & SECURITY",
      nodes: ["Connected System","REST Integration","OAuth 2.0","Groups & Permissions","Record-Level Security","Robotic Task (RPA)","Control Room","OpenAPI Import"]
    },
    summary: "I Connected System centralizzano le configurazioni di connessione. La sicurezza è basata su Groups con livelli Administrator/Editor/Initiator/Viewer/Deny. La record-level security usa a!recordFilterList(). L'RPA nativa (Jidoka) integra robot nei processi tramite Robotic Task."
  },
];

// Exam questions pool (40 questions)
const EXAM_QUESTIONS = [
  { q: "Appian è classificata come:", opts: ["ERP","Low-code platform","Database","CRM"], ans: 1 },
  { q: "Le process variables usano il prefisso:", opts: ["var!","local!","pv!","ri!"], ans: 2 },
  { q: "SAIL sta per:", opts: ["Simple Application Interface Layer","Self-Assembling Interface Layer","Scalable AI Logic","System Application Integration"], ans: 1 },
  { q: "Il gateway che esegue UN SOLO ramo:", opts: ["AND","OR","XOR","SPLIT"], ans: 2 },
  { q: "I permessi Appian sono assegnati a:", opts: ["Singoli utenti","Gruppi","Ruoli di sistema","Tutti"], ans: 1 },
  { q: "Quale prefisso usano i Rule Inputs di una interface?", opts: ["pv!","local!","ri!","val!"], ans: 2 },
  { q: "a!queryRecordType() serve a:", opts: ["Creare record","Interrogare record","Eliminare record","Aggiornare processi"], ans: 1 },
  { q: "Il Connected System centralizza:", opts: ["Business logic","Configurazione connessione","UI components","Process Models"], ans: 1 },
  { q: "showWhen controlla:", opts: ["Validazione","Visibilità condizionale","Ordinamento","Performance"], ans: 1 },
  { q: "L'RPA nativa di Appian proviene da:", opts: ["UiPath","Jidoka","Blue Prism","WorkFusion"], ans: 1 },
  { q: "Un Package in Appian serve per:", opts: ["Backup DB","Deployment tra ambienti","Sicurezza","Monitoraggio"], ans: 1 },
  { q: "a!formLayout() è il:", opts: ["Componente griglia","Layout principale dei form","Sezione collassabile","Campo testo"], ans: 1 },
  { q: "Il Record Type con dati da API esterne usa:", opts: ["DB Table","Process Model","Web Service","File System"], ans: 2 },
  { q: "Le Expression Rules sono:", opts: ["Processi BPMN","Funzioni riutilizzabili","Interfacce SAIL","Connettori"], ans: 1 },
  { q: "Il permesso Initiator permette di:", opts: ["Solo leggere","Modificare oggetti","Avviare processi","Amministrare"], ans: 2 },
  { q: "Appian Designer è accessibile via:", opts: ["Desktop app","IDE locale","Browser web","API only"], ans: 2 },
  { q: "a!gridField() supporta:", opts: ["Solo display","Paginazione, ordinamento, selezione","Solo paginazione","Solo selezione"], ans: 1 },
  { q: "Il Timer Boundary Event:", opts: ["Blocca il processo","Scatta dopo un tempo definito","Invia notifiche push","Crea sub-process"], ans: 1 },
  { q: "a!refreshVariable() aggiorna:", opts: ["Il DB","Dati dinamicamente al cambio dipendenze","L'intera pagina","Il process model"], ans: 1 },
  { q: "Il deploy Appian segue il flusso:", opts: ["PROD→DEV","TEST→DEV→PROD","DEV→TEST→PROD","DEV→PROD"], ans: 2 },
  { q: "Le relazioni tra Record Types generano JOIN:", opts: ["Manualmente","Automaticamente","Via stored proc","Non supportati"], ans: 1 },
  { q: "Appian Cloud è basata su:", opts: ["Azure","GCP","AWS","IBM"], ans: 2 },
  { q: "Il nodo 'Script Task' esegue:", opts: ["Form utente","Logica expression rule","Chiamata API","Robot RPA"], ans: 1 },
  { q: "La sicurezza a livello record usa:", opts: ["SQL WHERE","pv!security","a!recordFilterList()","Group admin"], ans: 2 },
  { q: "OpenAPI Integration consente di:", opts: ["Creare DB","Importare spec Swagger/OpenAPI","Disegnare UI","Configurare RPA"], ans: 1 },
  { q: "L'oggetto 'Constant' in Appian è:", opts: ["Una variabile di processo","Un valore fisso riutilizzabile","Un tipo di record","Un gateway"], ans: 1 },
  { q: "a!queryAggregation() calcola:", opts: ["JOIN tra tabelle","Aggregati COUNT/SUM/AVG","Validazioni UI","Routing processi"], ans: 1 },
  { q: "Il Control Room RPA gestisce:", opts: ["Solo i Process Models","Robot, scheduling, monitoraggio","La sicurezza dei gruppi","Le interfacce SAIL"], ans: 1 },
  { q: "Il 'default flow' su XOR evita:", opts: ["Errori di validazione","Processi bloccati","Lentezza query","Log eccessivi"], ans: 1 },
  { q: "loggedInUser() restituisce:", opts: ["Il nome dell'app","Il server","L'utente loggato","Il gruppo admin"], ans: 2 },
];

// ─── UTILITY ────────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - .5);
const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    home: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    map: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    book: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    exam: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    star: <svg fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    lock: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    check: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    download: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    flame: <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-4.5 5-4.5 10a4.5 4.5 0 009 0c0-2.5-1.5-5-1.5-5s-.5 2-1.5 2-1.5-2.5-1.5-5z"/></svg>,
  };
  return icons[name] || null;
};

// ─── QUIZ COMPONENT ──────────────────────────────────────────────────────────
function QuizBlock({ questions, onComplete, title = "Quiz" }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.ans) setScore(s => s + 1);
  };

  const next = () => {
    if (idx < questions.length - 1) {
      setIdx(i => i + 1); setSelected(null); setAnswered(false);
    } else {
      setDone(true);
      onComplete && onComplete(score + (selected === q.ans ? 1 : 0), questions.length);
    }
  };

  if (done) {
    const finalScore = score + (selected === q.ans ? 1 : 0);
    const pct = Math.round(finalScore / questions.length * 100);
    const passed = pct >= 70;
    return (
      <div className="fade-up" style={{textAlign:'center'}}>
        <div style={{fontSize:56, marginBottom:12}}>{passed ? '🎉' : '💪'}</div>
        <div style={{fontFamily:'var(--serif)', fontSize:28, marginBottom:8}}>
          {passed ? 'Ottimo!' : 'Riprova!'}
        </div>
        <div style={{fontFamily:'var(--mono)', fontSize:42, color: passed?'var(--green)':'var(--red)', margin:'16px 0'}}>
          {pct}%
        </div>
        <div style={{color:'var(--muted)', fontSize:13, marginBottom:20}}>
          {finalScore}/{questions.length} risposte corrette
        </div>
        <div className={`alert ${passed?'alert-green':'alert-red'}`}>
          {passed ? '✅ Soglia 70% superata! Avanza al prossimo argomento.' : '❌ Soglia 70% non raggiunta. Rileggi la lezione e riprova.'}
        </div>
        <button className="btn btn-primary" style={{marginTop:16}} onClick={() => { setIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); }}>
          RIPROVA
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="flex-between" style={{marginBottom:16}}>
        <span className="tag tag-orange">{title}</span>
        <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)'}}>
          {idx+1}/{questions.length}
        </span>
      </div>
      <div className="prog-track" style={{marginBottom:20}}>
        <div className="prog-fill" style={{width:`${(idx/questions.length)*100}%`}}/>
      </div>
      <p style={{fontSize:15, fontWeight:500, marginBottom:20, lineHeight:1.5}}>{q.q}</p>
      {q.opts.map((opt, i) => (
        <button
          key={i}
          className={`quiz-option ${answered && i===q.ans?'correct':''} ${answered && i===selected && i!==q.ans?'wrong':''} ${!answered&&i===selected?'selected':''}`}
          onClick={() => pick(i)}
        >
          <span style={{fontFamily:'var(--mono)', fontSize:10, marginRight:10, color:'var(--muted)'}}>
            {String.fromCharCode(65+i)}
          </span>
          {opt}
        </button>
      ))}
      {answered && (
        <div className="fade-up" style={{marginTop:8}}>
          <div className={`alert ${selected===q.ans?'alert-green':'alert-red'}`}>
            {selected===q.ans ? '✅ Corretto!' : `❌ Risposta corretta: ${q.opts[q.ans]}`}
          </div>
          <button className="btn btn-primary" style={{marginTop:10}} onClick={next}>
            {idx<questions.length-1 ? 'AVANTI →' : 'FINE QUIZ'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CONCEPT MAP ─────────────────────────────────────────────────────────────
function ConceptMap({ map, chapterTitle }) {
  return (
    <div>
      <div style={{textAlign:'center', marginBottom:20}}>
        <div className="cmap-center">{map.center}</div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        {map.nodes.map((n,i) => (
          <div key={i} className="cmap-node" style={{
            borderColor: i%3===0?'var(--accent)': i%3===1?'var(--blue)':'var(--green)',
            color: i%3===0?'var(--accent)': i%3===1?'var(--blue)':'var(--green)',
          }}>
            {n}
          </div>
        ))}
      </div>
      <div style={{marginTop:16, textAlign:'center'}}>
        <button className="btn btn-outline" style={{width:'auto', padding:'10px 20px'}}
          onClick={() => {
            const content = `MAPPA CONCETTUALE: ${chapterTitle}\n\nCentro: ${map.center}\n\nNodi:\n${map.nodes.map((n,i)=>`${i+1}. ${n}`).join('\n')}`;
            const blob = new Blob([content], {type:'text/plain'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `mappa_${chapterTitle.replace(/\s/g,'_')}.txt`;
            a.click();
          }}>
          <span style={{display:'flex', alignItems:'center', gap:8, justifyContent:'center'}}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            SCARICA MAPPA
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── EXAM SIMULATOR ──────────────────────────────────────────────────────────
function ExamSimulator({ onBack }) {
  const [phase, setPhase] = useState('intro'); // intro | exam | result
  const [questions] = useState(() => shuffle(EXAM_QUESTIONS).slice(0, 30));
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60*45); // 45 min
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase('result'); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const pick = (i) => setAnswers(a => ({...a, [current]: i}));
  const submit = () => { clearInterval(timerRef.current); setPhase('result'); };

  if (phase === 'intro') return (
    <div className="fade-up">
      <button className="btn btn-secondary" style={{width:'auto', marginBottom:20}} onClick={onBack}>
        ← Torna alla Home
      </button>
      <div style={{textAlign:'center', marginBottom:24}}>
        <div style={{fontSize:64, marginBottom:8}}>🎯</div>
        <div style={{fontFamily:'var(--serif)', fontSize:26, marginBottom:8}}>Simulazione Esame</div>
        <div style={{color:'var(--muted)', fontSize:13}}>Appian Certified Developer</div>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {[['30','Domande'],['45 min','Tempo'],['70%','Soglia Pass'],['Casuale','Ordine']].map(([v,l]) => (
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:'var(--serif)', fontSize:26, color:'var(--accent)'}}>{v}</div>
              <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="alert alert-blue" style={{marginBottom:16}}>
        📋 Le domande coprono tutti i capitoli del corso. Il timer parte con l'inizio dell'esame.
      </div>
      <button className="btn btn-primary" onClick={() => setPhase('exam')}>
        INIZIA ESAME →
      </button>
    </div>
  );

  if (phase === 'exam') {
    const q = questions[current];
    const danger = timeLeft < 300;
    return (
      <div className="fade-up">
        <div className="flex-between" style={{marginBottom:16}}>
          <span className="tag tag-orange">ESAME</span>
          <span className={`timer-ring ${danger?'danger':''}`}>{fmtTime(timeLeft)}</span>
        </div>
        <div className="prog-track" style={{marginBottom:20}}>
          <div className="prog-fill" style={{width:`${(current/questions.length)*100}%`}}/>
        </div>
        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginBottom:12}}>
          DOMANDA {current+1} DI {questions.length}
        </div>
        <p style={{fontSize:15, fontWeight:500, marginBottom:20, lineHeight:1.5}}>{q.q}</p>
        {q.opts.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option ${answers[current]===i?'selected':''}`}
            onClick={() => pick(i)}
          >
            <span style={{fontFamily:'var(--mono)', fontSize:10, marginRight:10, color:'var(--muted)'}}>
              {String.fromCharCode(65+i)}
            </span>
            {opt}
          </button>
        ))}
        <div style={{display:'flex', gap:10, marginTop:16}}>
          {current > 0 && <button className="btn btn-secondary" onClick={() => setCurrent(c=>c-1)}>← Prev</button>}
          {current < questions.length-1
            ? <button className="btn btn-primary" onClick={() => setCurrent(c=>c+1)} disabled={answers[current]==null}>Next →</button>
            : <button className="btn btn-green" onClick={submit}>CONSEGNA ESAME ✓</button>
          }
        </div>
        <div style={{marginTop:12, textAlign:'center'}}>
          <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)'}}>
            Risposte: {Object.keys(answers).length}/{questions.length}
          </span>
        </div>
      </div>
    );
  }

  // Result
  const correct = questions.filter((q, i) => answers[i] === q.ans).length;
  const pct = Math.round(correct / questions.length * 100);
  const passed = pct >= 70;
  return (
    <div className="fade-up" style={{textAlign:'center'}}>
      <div style={{fontSize:64, marginBottom:12}}>{passed?'🏆':'📚'}</div>
      <div style={{fontFamily:'var(--serif)', fontSize:28, marginBottom:4}}>
        {passed ? 'CERTIFICAZIONE SUPERATA!' : 'Non ancora...'}
      </div>
      <div style={{fontFamily:'var(--mono)', fontSize:56, color:passed?'var(--green)':'var(--red)', margin:'20px 0'}}>
        {pct}%
      </div>
      <div className={`alert ${passed?'alert-green':'alert-red'}`} style={{marginBottom:16}}>
        {passed
          ? `✅ Complimenti! ${correct}/${questions.length} corrette. Sei pronto per l'esame reale Appian!`
          : `❌ ${correct}/${questions.length} corrette. Soglia: 70%. Ripassate le sezioni più deboli.`}
      </div>
      {/* Breakdown */}
      <div className="card" style={{textAlign:'left', marginBottom:16}}>
        <div style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', marginBottom:12}}>RIEPILOGO RISPOSTE</div>
        {questions.slice(0,10).map((q,i) => (
          <div key={i} className="flex-between" style={{marginBottom:8, fontSize:12}}>
            <span style={{color:'var(--muted)', flex:1, marginRight:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {i+1}. {q.q}
            </span>
            <span style={{color:answers[i]===q.ans?'var(--green)':'var(--red)', flexShrink:0}}>
              {answers[i]===q.ans?'✓':'✗'}
            </span>
          </div>
        ))}
        {questions.length > 10 && <div style={{color:'var(--muted)', fontSize:11, marginTop:4}}>...e altre {questions.length-10} domande</div>}
      </div>
      <button className="btn btn-outline" onClick={() => { setPhase('intro'); setAnswers({}); setCurrent(0); setTimeLeft(60*45); }}>
        NUOVO TENTATIVO
      </button>
      <button className="btn btn-secondary" style={{marginTop:10}} onClick={onBack}>
        ← Torna alla Home
      </button>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function AppianApp() {
  const [tab, setTab] = useState('home');
  const [xp, setXp] = useState(320);
  const [streak, setStreak] = useState(7);
  const [completedLessons, setCompletedLessons] = useState(new Set(['1.1','1.2']));
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonPhase, setLessonPhase] = useState('content'); // content | quiz | done
  const [chapterQuizMode, setChapterQuizMode] = useState(false);
  const [showConceptMap, setShowConceptMap] = useState(false);
  const [examMode, setExamMode] = useState(false);

  const totalLessons = CHAPTERS.reduce((a,c) => a+c.lessons.length, 0);
  const doneCount = completedLessons.size;
  const progress = Math.round(doneCount / totalLessons * 100);

  const addXp = (n) => setXp(x => x+n);

  const markLessonDone = (id) => {
    setCompletedLessons(s => { const ns = new Set(s); ns.add(id); return ns; });
    addXp(30);
  };

  const isLessonUnlocked = (chapter, lessonIdx) => {
    if (lessonIdx === 0) return true;
    return completedLessons.has(chapter.lessons[lessonIdx-1].id);
  };

  const isChapterUnlocked = (chapterIdx) => {
    if (chapterIdx === 0) return true;
    const prev = CHAPTERS[chapterIdx-1];
    return prev.lessons.every(l => completedLessons.has(l.id));
  };

  // ── Exam mode ──
  if (examMode) return (
    <div style={{minHeight:'100vh', background:'var(--bg)'}}>
      <style>{STYLES}</style>
      <div className="phone-shell">
        <div className="header">
          <span className="header-logo">APPIAN</span>
          <span className="header-title">Simulazione Esame</span>
          <span className="header-xp">🔥 {streak}</span>
        </div>
        <div className="content">
          <ExamSimulator onBack={() => setExamMode(false)} />
        </div>
      </div>
    </div>
  );

  // ── Lesson detail ──
  if (activeLesson) {
    const ch = activeChapter;
    const ls = activeLesson;
    return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <style>{STYLES}</style>
        <div className="phone-shell">
          <div className="header">
            <button className="btn btn-secondary" style={{width:'auto', padding:'6px 12px', fontSize:11}} onClick={() => { setActiveLesson(null); setLessonPhase('content'); }}>
              ← Indietro
            </button>
            <span style={{fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)'}}>{ls.id}</span>
            <span className="header-xp">+30 XP</span>
          </div>
          <div className="content">
            {lessonPhase === 'content' && (
              <div className="fade-up">
                <div className="flex-row" style={{marginBottom:16}}>
                  <span className="tag tag-orange">{ch.tag}</span>
                  <span style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)'}}>{ls.duration}</span>
                </div>
                <h2 style={{fontFamily:'var(--serif)', fontSize:24, marginBottom:20}}>{ls.title}</h2>
                <div className="lesson-body" dangerouslySetInnerHTML={{__html: ls.content}} />
                <div className="divider"/>
                {/* Summary box */}
                <div className="card blue-border" style={{marginBottom:16}}>
                  <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--blue)', marginBottom:8}}>📋 PUNTI CHIAVE</div>
                  <div style={{fontSize:13, color:'#94a3b8', lineHeight:1.6}}>
                    Rivedi i concetti e poi esegui il mini-quiz per confermare la comprensione.
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setLessonPhase('quiz')}>
                  MINI-QUIZ →
                </button>
              </div>
            )}
            {lessonPhase === 'quiz' && (
              <div className="fade-up">
                <h3 style={{fontFamily:'var(--serif)', fontSize:20, marginBottom:20}}>Quiz: {ls.title}</h3>
                <QuizBlock
                  questions={ls.quiz}
                  title={`Lezione ${ls.id}`}
                  onComplete={(score, total) => {
                    if (score/total >= 0.67) {
                      markLessonDone(ls.id);
                      setLessonPhase('done');
                    } else {
                      setLessonPhase('quiz');
                    }
                  }}
                />
              </div>
            )}
            {lessonPhase === 'done' && (
              <div className="fade-up" style={{textAlign:'center'}}>
                <div style={{fontSize:72, marginBottom:12}}>⭐</div>
                <div style={{fontFamily:'var(--serif)', fontSize:26, marginBottom:8}}>Lezione Completata!</div>
                <div style={{fontFamily:'var(--mono)', fontSize:32, color:'var(--accent)', marginBottom:20}}>+30 XP</div>
                <button className="btn btn-primary" onClick={() => { setActiveLesson(null); setLessonPhase('content'); }}>
                  TORNA AL CAPITOLO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Chapter detail ──
  if (activeChapter) {
    const ch = activeChapter;
    const allDone = ch.lessons.every(l => completedLessons.has(l.id));

    if (chapterQuizMode) return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <style>{STYLES}</style>
        <div className="phone-shell">
          <div className="header">
            <button className="btn btn-secondary" style={{width:'auto', padding:'6px 12px', fontSize:11}} onClick={() => setChapterQuizMode(false)}>← Indietro</button>
            <span className="header-logo">TEST CAPITOLO</span>
            <span className="header-xp">{ch.emoji}</span>
          </div>
          <div className="content">
            <h3 style={{fontFamily:'var(--serif)', fontSize:22, marginBottom:20}}>Test: {ch.title}</h3>
            <QuizBlock
              questions={ch.chapterQuiz}
              title="Test Capitolo"
              onComplete={(score, total) => {
                if (score/total >= 0.7) {
                  setCompletedChapters(s => { const ns = new Set(s); ns.add(ch.id); return ns; });
                  addXp(ch.xp);
                }
              }}
            />
          </div>
        </div>
      </div>
    );

    if (showConceptMap) return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <style>{STYLES}</style>
        <div className="phone-shell">
          <div className="header">
            <button className="btn btn-secondary" style={{width:'auto', padding:'6px 12px', fontSize:11}} onClick={() => setShowConceptMap(false)}>← Indietro</button>
            <span className="header-logo">MAPPA</span>
            <span className="header-xp">{ch.emoji}</span>
          </div>
          <div className="content">
            <h3 style={{fontFamily:'var(--serif)', fontSize:22, marginBottom:20}}>Mappa: {ch.title}</h3>
            <ConceptMap map={ch.conceptMap} chapterTitle={ch.title} />
            <div className="divider"/>
            <div className="card blue-border">
              <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--blue)', marginBottom:8}}>📄 RIASSUNTO</div>
              <p style={{fontSize:13, lineHeight:1.7, color:'#94a3b8'}}>{ch.summary}</p>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <style>{STYLES}</style>
        <div className="phone-shell">
          <div className="header">
            <button className="btn btn-secondary" style={{width:'auto', padding:'6px 12px', fontSize:11}} onClick={() => setActiveChapter(null)}>← Capitoli</button>
            <span style={{fontFamily:'var(--serif)', fontSize:16}}>{ch.title}</span>
            <span className="header-xp">{ch.emoji}</span>
          </div>
          <div className="content">
            {/* Chapter header */}
            <div className="card accent-border" style={{textAlign:'center'}}>
              <div style={{fontSize:48, marginBottom:8}}>{ch.emoji}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:22, marginBottom:4}}>{ch.title}</div>
              <span className="tag tag-orange">{ch.tag}</span>
              <div style={{margin:'12px 0'}}>
                <div className="prog-track">
                  <div className="prog-fill" style={{width:`${ch.lessons.filter(l=>completedLessons.has(l.id)).length/ch.lessons.length*100}%`}}/>
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginTop:6}}>
                  {ch.lessons.filter(l=>completedLessons.has(l.id)).length}/{ch.lessons.length} lezioni
                </div>
              </div>
            </div>

            {/* Tools */}
            <div style={{display:'flex', gap:10}}>
              <button className="btn btn-outline" style={{flex:1, fontSize:11}} onClick={() => setShowConceptMap(true)}>
                🗺️ Mappa + Riassunto
              </button>
              <button
                className={`btn ${allDone?'btn-green':'btn-secondary'}`}
                style={{flex:1, fontSize:11}}
                onClick={() => allDone && setChapterQuizMode(true)}
                disabled={!allDone}
              >
                {allDone ? '📝 Test Capitolo' : '🔒 Test (completa lezioni)'}
              </button>
            </div>

            {/* Lessons */}
            <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', letterSpacing:2}}>LEZIONI</div>
            {ch.lessons.map((ls, i) => {
              const done = completedLessons.has(ls.id);
              const unlocked = isLessonUnlocked(ch, i);
              return (
                <div key={ls.id} className={`card ${done?'green-border':''}`}
                  style={{cursor: unlocked?'pointer':'not-allowed', opacity: unlocked?1:.6}}
                  onClick={() => { if (unlocked) { setActiveLesson(ls); setLessonPhase('content'); } }}>
                  <div className="flex-between">
                    <div>
                      <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginBottom:4}}>{ls.id}</div>
                      <div style={{fontWeight:500, fontSize:15}}>{ls.title}</div>
                      <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginTop:4}}>{ls.duration}</div>
                    </div>
                    <div style={{color: done?'var(--green)': unlocked?'var(--accent)':'var(--muted)', fontSize:18}}>
                      {done ? '✓' : unlocked ? '→' : '🔒'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Main tabs ──
  return (
    <div style={{minHeight:'100vh', background:'var(--bg)'}}>
      <style>{STYLES}</style>
      <div className="phone-shell">
        <div className="header">
          <span className="header-logo">APPIAN</span>
          <span className="header-title" style={{fontFamily:'var(--serif)'}}>Dev Cert</span>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span className="header-xp">🔥 {streak}</span>
            <span className="header-xp" style={{background:'rgba(251,146,60,.15)'}}>{xp} XP</span>
          </div>
        </div>

        <div className="content">
          {/* ── HOME ── */}
          {tab === 'home' && (
            <div className="fade-up">
              {/* Welcome */}
              <div className="card accent-border">
                <div style={{fontFamily:'var(--serif)', fontSize:22, marginBottom:4}}>
                  Benvenuto, Developer! 👋
                </div>
                <div style={{color:'var(--muted)', fontSize:13, marginBottom:16}}>
                  Percorso certificazione Appian Developer
                </div>
                <div className="prog-track" style={{marginBottom:8}}>
                  <div className="prog-fill" style={{width:`${progress}%`}}/>
                </div>
                <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)'}}>
                  {progress}% completato · {doneCount}/{totalLessons} lezioni
                </div>
              </div>

              {/* Stats */}
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-num">{streak}</div>
                  <div className="stat-label">GIORNI STREAK</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{xp}</div>
                  <div className="stat-label">XP TOTALI</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{completedChapters.size}</div>
                  <div className="stat-label">CAPITOLI PASS</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{doneCount}</div>
                  <div className="stat-label">LEZIONI OK</div>
                </div>
              </div>

              {/* Quick continue */}
              <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', letterSpacing:2}}>CONTINUA DA QUI</div>
              {CHAPTERS.map((ch, idx) => {
                const done = ch.lessons.every(l => completedLessons.has(l.id));
                const unlocked = isChapterUnlocked(idx);
                const lessDone = ch.lessons.filter(l=>completedLessons.has(l.id)).length;
                if (done) return null;
                if (!unlocked) return null;
                return (
                  <div key={ch.id} className="card accent-border" style={{cursor:'pointer'}} onClick={() => setActiveChapter(ch)}>
                    <div className="flex-between" style={{marginBottom:10}}>
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        <div style={{fontSize:32}}>{ch.emoji}</div>
                        <div>
                          <div style={{fontWeight:600}}>{ch.title}</div>
                          <span className="tag tag-orange" style={{marginTop:4}}>{ch.tag}</span>
                        </div>
                      </div>
                      <div style={{color:'var(--accent)', fontSize:20}}>→</div>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{width:`${lessDone/ch.lessons.length*100}%`}}/>
                    </div>
                    <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginTop:6}}>
                      {lessDone}/{ch.lessons.length} lezioni · +{ch.xp} XP
                    </div>
                  </div>
                );
              })}

              {/* Exam CTA */}
              <div className="card" style={{background:'linear-gradient(135deg, #1a1a2e, #16213e)', border:'1px solid rgba(249,115,22,.4)', cursor:'pointer', textAlign:'center'}}
                onClick={() => setExamMode(true)}>
                <div style={{fontSize:36, marginBottom:8}}>🎯</div>
                <div style={{fontFamily:'var(--serif)', fontSize:20, marginBottom:4}}>Simulazione Esame</div>
                <div style={{color:'var(--muted)', fontSize:12, marginBottom:12}}>30 domande · 45 min · soglia 70%</div>
                <div className="tag tag-orange">PROVA ORA</div>
              </div>
            </div>
          )}

          {/* ── ROADMAP ── */}
          {tab === 'roadmap' && (
            <div className="fade-up">
              <h2 style={{fontFamily:'var(--serif)', fontSize:24, marginBottom:4}}>Roadmap</h2>
              <p style={{color:'var(--muted)', fontSize:13, marginBottom:24}}>Percorso certificazione Appian Developer</p>

              {CHAPTERS.map((ch, idx) => {
                const done = completedChapters.has(ch.id);
                const unlocked = isChapterUnlocked(idx);
                const isActive = unlocked && !done;
                const lessDone = ch.lessons.filter(l=>completedLessons.has(l.id)).length;

                return (
                  <div key={ch.id}>
                    <div className="roadmap-step">
                      <div className="step-line-wrap">
                        <div className={`step-dot ${done?'done':isActive?'active':'locked'}`}>
                          {done ? '✓' : ch.id}
                        </div>
                        {idx < CHAPTERS.length-1 && <div className={`step-connector ${done?'done':''}`} style={{minHeight:60}}/>}
                      </div>
                      <div
                        className={`card ${done?'green-border':isActive?'accent-border':''}`}
                        style={{flex:1, cursor:unlocked?'pointer':'default', opacity:unlocked?1:.5}}
                        onClick={() => unlocked && setActiveChapter(ch)}
                      >
                        <div className="flex-between" style={{marginBottom:8}}>
                          <span style={{fontSize:24}}>{ch.emoji}</span>
                          <span className={`tag ${done?'tag-green':isActive?'tag-orange':'tag-muted'}`}>
                            {done?'COMPLETATO':isActive?'IN CORSO':'BLOCCATO'}
                          </span>
                        </div>
                        <div style={{fontWeight:600, marginBottom:4}}>{ch.title}</div>
                        <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)', marginBottom:10}}>
                          {ch.lessons.length} lezioni · +{ch.xp} XP
                        </div>
                        <div className="prog-track">
                          <div className="prog-fill" style={{width:`${lessDone/ch.lessons.length*100}%`}}/>
                        </div>
                        <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginTop:4}}>
                          {lessDone}/{ch.lessons.length}
                        </div>
                      </div>
                    </div>
                    {idx < CHAPTERS.length-1 && <div style={{height:4}}/>}
                  </div>
                );
              })}

              {/* Final exam node */}
              <div className="roadmap-step">
                <div className="step-line-wrap">
                  <div className="step-dot" style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))', borderColor:'var(--accent)', color:'#000', fontSize:16}}>🎯</div>
                </div>
                <div className="card accent-border" style={{flex:1, cursor:'pointer'}} onClick={() => setExamMode(true)}>
                  <div style={{fontFamily:'var(--serif)', fontSize:18, marginBottom:4}}>Simulazione Esame Finale</div>
                  <div style={{color:'var(--muted)', fontSize:12}}>30 domande · 45 minuti · soglia 70%</div>
                </div>
              </div>
            </div>
          )}

          {/* ── CAPITOLI ── */}
          {tab === 'chapters' && (
            <div className="fade-up">
              <h2 style={{fontFamily:'var(--serif)', fontSize:24, marginBottom:4}}>Capitoli</h2>
              <p style={{color:'var(--muted)', fontSize:13, marginBottom:20}}>Seleziona un capitolo per iniziare</p>
              {CHAPTERS.map((ch, idx) => {
                const done = completedChapters.has(ch.id);
                const unlocked = isChapterUnlocked(idx);
                const lessDone = ch.lessons.filter(l=>completedLessons.has(l.id)).length;
                return (
                  <div key={ch.id} className={`card ${done?'green-border':unlocked?'':'border-opacity'}`}
                    style={{cursor:unlocked?'pointer':'not-allowed', opacity:unlocked?1:.55, marginBottom:12}}
                    onClick={() => unlocked && setActiveChapter(ch)}>
                    <div className="flex-row" style={{marginBottom:10}}>
                      <div style={{fontSize:36}}>{ch.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600, fontSize:16}}>{ch.title}</div>
                        <div style={{display:'flex', gap:8, marginTop:4}}>
                          <span className={`tag ${done?'tag-green':unlocked?'tag-orange':'tag-muted'}`}>
                            {done?'✓ PASS':unlocked?ch.tag:'🔒'}
                          </span>
                          <span className="tag tag-blue">+{ch.xp} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{width:`${lessDone/ch.lessons.length*100}%`}}/>
                    </div>
                    <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginTop:6}}>
                      {lessDone}/{ch.lessons.length} lezioni completate
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── ESAME ── */}
          {tab === 'exam' && (
            <div className="fade-up">
              <h2 style={{fontFamily:'var(--serif)', fontSize:24, marginBottom:4}}>Simulazione Esame</h2>
              <p style={{color:'var(--muted)', fontSize:13, marginBottom:20}}>Appian Certified Developer</p>

              <div className="card" style={{textAlign:'center', marginBottom:16}}>
                <div style={{fontSize:56, marginBottom:8}}>🏆</div>
                <div style={{fontFamily:'var(--serif)', fontSize:20, marginBottom:16}}>Pronto per il test?</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
                  {[['30','Domande'],['45 min','Durata'],['70%','Pass Score'],['Random','Ordine']].map(([v,l]) => (
                    <div key={l} className="stat-box">
                      <div style={{fontFamily:'var(--serif)', fontSize:22, color:'var(--accent)'}}>{v}</div>
                      <div style={{fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => setExamMode(true)}>
                  INIZIA SIMULAZIONE →
                </button>
              </div>

              <div className="card blue-border">
                <div style={{fontFamily:'var(--mono)', fontSize:10, color:'var(--blue)', marginBottom:10}}>📋 ARGOMENTI COPERTI</div>
                {CHAPTERS.map(ch => (
                  <div key={ch.id} className="flex-between" style={{marginBottom:8}}>
                    <span style={{fontSize:13}}>{ch.emoji} {ch.title}</span>
                    <span className="tag tag-muted">{ch.chapterQuiz.length} dom.</span>
                  </div>
                ))}
              </div>

              <div className="alert alert-blue">
                💡 Consiglio: completa almeno 3 capitoli prima di affrontare la simulazione!
              </div>
            </div>
          )}
        </div>

        <div className="nav-bar">
          {[
            {id:'home', label:'Home', icon:'home'},
            {id:'roadmap', label:'Roadmap', icon:'map'},
            {id:'chapters', label:'Capitoli', icon:'book'},
            {id:'exam', label:'Esame', icon:'exam'},
          ].map(({id, label, icon}) => (
            <button key={id} className={`nav-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>
              <Icon name={icon}/>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
