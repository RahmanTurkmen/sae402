let gameState = { bet: "", viewBoost: 0 };
let historyStack = ["title"];
const totalEpisodes = 15;

// Fonction pour jouer le son gameover
function playGameoverSound() {
  new Audio("assets/son/gameover.mp3").play().catch(() => {});
}

// Fonction pour jouer le son hover
function playHoverSound() {
  new Audio("assets/son/hover.mp3").play().catch(() => {});
}

// Fonction pour jouer le son 3 2 1
function play321Sound() {
  new Audio("assets/son/321.mp3").play().catch(() => {});
}

// Fonction pour jouer le son accel (loop jusqu'au prochain choix)
let accelAudio = null;
function playAccelSound() {
  accelAudio = new Audio("assets/son/accel.mp3");
  accelAudio.loop = true;
  accelAudio.play().catch(() => {});
}
function stopAccelSound() {
  if (accelAudio) {
    accelAudio.pause();
    accelAudio = null;
  }
}

// Globals pour le mini-jeu de démarrage
let countdownTimer = null;
let isWaitingForZ = false;

// Template HTML pour le mini-jeu
const raceStartHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; position:relative; overflow:hidden;" id="race-click-zone">
      <div id="race-bg" style="position:absolute; inset:0; background-image:url('assets/63.webp'); background-size:cover; background-position:center; background-repeat:no-repeat; opacity:0; transition:opacity 3.2s ease;"></div>
            <div id="countdown-text" class="countdown-num" style="font-family:'Bebas Neue'; font-size:300px; text-shadow:0 0 50px red; color:white; z-index:10; pointer-events:none;">3</div>
            <div id="z-prompt" style="font-family:'Share Tech Mono'; font-size:30px; color:var(--electric-blue); opacity:0; z-index:10; margin-top:20px; animation: blink 0.3s infinite; text-shadow: 0 0 20px var(--electric-blue); pointer-events:none;">[ APPUIE SUR 'Z' OU CLIQUE ]</div>
        </div>
    `;

// SCÈNE D'ACCÉLÉRATION COMMUNE (remplacement par images)
const sharedAccelPanels = [
  {
    delay: 0,
    html: `<img src="assets/10.webp" /><img src="assets/hono/1.webp" style="position:absolute; top:-40px; left:-25px; width:520px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-9deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
  },
  {
    delay: 200,
    html: `<img src="assets/11.webp" /><img src="assets/hono/2.webp" style="position:absolute; bottom:-45px; right:-30px; width:460px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(12deg); filter:drop-shadow(0 0 20px rgba(255,0,60,0.85));" />`,
  },
  {
    delay: 400,
    html: `<img src="assets/12.webp" /><div class="caption" style="top:20px; left:20px;">0 à 100 en 4.2 secondes. Le G-Force t'écrase.</div><div class="bubble evil" style="bottom:20px; right:20px;">Il tire fort le salaud !</div>`,
  },
];

const storyGraph = {
  title: {
    title: "Titre",
    grid: "grid-hero",
    hideNav: true,
    html: `<div id="title-screen"><img src="assets/01.webp" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.4;" /><h1 class="title-logo">NO HESI</h1><p class="title-sub"></p><button class="start-btn choice-btn" onclick="goTo('context')">LANCER LE MOTEUR</button></div>`,
  },
  context: {
    title: "MISE EN CONTEXTE",
    grid: "grid-hero",
    next: "intro",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div class="choice-wrapper" style="background:rgba(0,0,20,0.97); padding:40px;"><img src="assets/01.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.25;" /><h2 class="choice-title" style="font-size:60px; margin-bottom:30px;">NO HESI</h2><div style="font-size:20px; line-height:1.8; max-width:900px; margin:0 auto; color:#ddd; text-align:left;"><p style="margin-bottom:15px;"><span style="color:var(--neon-orange); font-weight:bold;">NO HESI</span> c'est l'histoire d'une course illégale, une confrontation ultime entre deux pilotes du quartier.</p><p style="margin-bottom:15px;">Tu joues un jeune conducteur qui relève le défi face à <span style="color:var(--electric-blue); font-weight:bold;">Samy</span>, un rival redoutable au volant de sa puissante 350Z.</p><p style="margin-bottom:15px;">Au fil de la course, <span style="color:var(--neon-orange);">tu devras faire des choix</span> qui détermineront l'issue : tu peux remporter la victoire, finir deuxième... ou tout perdre dans un crash.</p><p style="color:#999; font-style:italic;">La tension monte. Les enjeux sont énormes. Y a pas de retour en arrière.</p></div><button class="choice-btn blue" style="width:300px; margin-top:40px;" onclick="goTo('intro')">Lancer le moteur</button></div>`,
      },
    ],
  },
  intro: {
    title: "8000 RPM",
    grid: "grid-3-mos",
    next: "adversaire",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/01.webp" /><img src="assets/hono/3.webp" style="position:absolute; top:-25px; left:-15px; width:420px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-7deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" /><div class="caption" style="bottom:20px; left:20px;">Le moteur est bouillant.</div>`,
      },
      { delay: 200, html: `<img src="assets/02.webp" />` },
      {
        delay: 400,
        html: `<img src="assets/03.webp" /><div class="bubble" style="top:20px; left:20px;">Le live est lancé. Il est en retard ce mec ou quoi ?</div>`,
      },
    ],
  },
  adversaire: {
    title: "L'ADVERSAIRE",
    grid: "grid-3-row",
    next: "mise",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/04.webp" /><img src="assets/hono/4.webp" style="position:absolute; top:-40px; left:-30px; width:490px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-11deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/05.webp" /><div class="caption" style="bottom:20px; right:20px;">Samy déboule enfin en 350Z.</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/06.webp" /><div class="bubble evil" style="bottom:30px; right:30px;">On règle ça ce soir, une bonne fois pour toutes.</div>`,
      },
    ],
  },
  mise: {
    title: "CHOIX 1 : LA MISE",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div class="choice-wrapper"><h2 class="choice-title">CHOIX 1 : LA MISE</h2><div class="choice-container"><button class="choice-btn blue" onclick="setVar('bet', 'Carte Grise'); goTo('c_4')">CARTE GRISE</button><button class="choice-btn" onclick="setVar('bet', '1 000 balles'); goTo('m_4')">1 000 BALLES</button><button class="choice-btn" style="border-color:#fff;" onclick="setVar('bet', 'Le respect du quartier'); goTo('r_4')">LE RESPECT DU QUARTIER</button></div></div>`,
      },
    ],
  },

  /* ====== PATH 1: MONEY ====== */
  m_4: {
    title: "L'APPÂT DU GAIN",
    grid: "grid-asym",
    next: "m_5",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/07.webp" /><div class="bubble evil" style="bottom:30px; right:40px;">Prépare les billets Karim.</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/08.webp" /><div class="caption" style="top:20px; left:20px;">Mise en jeu : {bet}</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/09.webp" /><img src="assets/hono/5.webp" style="position:absolute; top:-30px; left:10px; width:430px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-7deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },
  m_5: {
    title: "LA GRILLE",
    grid: "grid-hero",
    isRaceStart: true,
    hideNav: true,
    next: "m_accel",
    html: raceStartHTML,
  },
  m_accel: {
    title: "DÉPART ARRÊTÉ",
    grid: "grid-3-mos",
    next: "m_6",
    panels: sharedAccelPanels,
  },
  m_6: {
    title: "COUP BAS",
    grid: "grid-3-mos",
    next: "m_7",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/38.webp" /><img src="assets/hono/6.webp" style="position:absolute; top:-35px; right:-25px; width:480px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(11deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" /><div class="caption" style="top:20px; left:20px;">Samy te coupe la route direct !</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/39.webp" /><div class="bubble" style="bottom:20px; left:20px;">Il veut jouer sale...</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/40.webp" /><div class="caption" style="bottom:20px; right:20px;">Le freinage d'urgence s'impose.</div>`,
      },
    ],
  },
  m_7: {
    title: "RÉACTION",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div class="choice-wrapper"><h2 class="choice-title">IL TE BLOQUE LA VOIE...</h2><div class="choice-container"><button class="choice-btn" onclick="goTo('m_8_pousse')">POUSSER AU PARE-CHOC</button><button class="choice-btn blue" onclick="goTo('m_8_esquive')">FEINTER SUR LA BANDE D'ARRÊT</button></div></div>`,
      },
    ],
  },
  m_8_pousse: {
    title: "CONTACT !",
    grid: "grid-2",
    next: "m_9",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/41.webp" /><img src="assets/hono/7.webp" style="position:absolute; bottom:-45px; right:-30px; width:470px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(10deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
      {
        delay: 200,
          html: `<img src="assets/42.webp" /><div class="bubble evil" style="top:30px; left:30px;">T'es malade ?!</div><div class="caption" style="bottom:30px; right:30px;">La 350Z vacille sous le choc.</div>`,
        },
    ],
  },
  m_8_esquive: {
    title: "DÉPASSEMENT ÉCLAIR",
    grid: "grid-2",
    next: "m_9",
    panels: [
      { delay: 0, html: `<img src="assets/29.webp" />` },
      {
        delay: 200,
        html: `<img src="assets/51.webp" /><div class="caption" style="top:30px; left:30px;">Passage au millimètre près !</div><img src="assets/hono/8.webp" style="position:absolute; bottom:-40px; right:-25px; width:450px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(8deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
    ],
  },
  m_9: {
    title: "LIGNE DROITE",
    grid: "grid-3-row",
    next: "m_10",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/44.webp" /><div class="bubble" style="bottom:30px; left:30px;">220 km/h. Je le lâche pas.</div>`,
      },
      { delay: 200, html: `<img src="assets/45.webp" />` },
      {
        delay: 400,
        html: `<img src="assets/105.webp" /><div class="caption" style="top:30px; right:30px;">Le moteur hurle à la mort.</div>`,
      },
    ],
  },
  m_10: {
    title: "PIÈGE DE SAMY",
    grid: "grid-asym",
    next: "m_11",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/46.webp" /><img src="assets/hono/9.webp" style="position:absolute; top:-40px; right:-25px; width:500px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(13deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/47.webp" /><div class="caption" style="top:20px; left:20px;">Il pile sur les freins sans raison !</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/48.webp" /><div class="bubble" style="bottom:20px; left:20px;">Brake check de l'enfer !</div>`,
      },
    ],
  },
  m_11: {
    title: "RÉFLEXE",
    grid: "grid-hero",
    next: "final_choice",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/49.webp" /><img src="assets/hono/1.webp" style="position:absolute; top:28%; left:-35px; width:560px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-6deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },

  /* ====== PATH 2: CAR ====== */
  c_4: {
    title: "PINK SLIP",
    grid: "grid-asym",
    next: "c_5",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/07.webp" /><div class="bubble evil" style="bottom:30px; right:40px;">Ta RX7 sera magnifique dans mon garage.</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/08.webp" /><div class="caption" style="top:20px; left:20px;">Enjeu : {bet}</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/09.webp" /><div class="bubble" style="top:30px; left:20px;">Dans tes rêves les plus fous.</div>`,
      },
    ],
  },
  c_5: {
    title: "LA GRILLE",
    grid: "grid-hero",
    isRaceStart: true,
    hideNav: true,
    next: "c_accel",
    html: raceStartHTML,
  },
  c_accel: {
    title: "DÉPART ARRÊTÉ",
    grid: "grid-3-mos",
    next: "c_6",
    panels: sharedAccelPanels,
  },
  c_6: {
    title: "A75 - 240 KM/H",
    grid: "grid-3-mos",
    next: "c_7",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/13.webp" /><div class="caption" style="top:20px; left:20px;">Autoroute déserte. Les deux caisses sont à fond.</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/14.webp" /><img src="assets/hono/2.webp" style="position:absolute; top:-35px; right:-25px; width:460px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(9deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 400,
        html: `<img src="assets/15.webp" /><div class="bubble" style="bottom:20px; left:20px;">Le compteur s'affole.</div>`,
      },
    ],
  },
  c_7: {
    title: "CHOIX 1.2 : FILATURE",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div class="choice-wrapper" style="background:rgba(0,0,20,0.95);"><img src="assets/16.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.4;" /><h2 class="choice-title" style="color:var(--police-red); text-shadow:0 0 30px red;">LES FLICS VOUS PRENNENT EN FILATURE</h2><div class="choice-container"><button class="choice-btn red" onclick="goTo('c_intercept')">CONTINUER LA COURSE ET ACCÉLÉRER</button><button class="choice-btn blue" onclick="goTo('c_8_stealth')">PASSER DANS DES RUELLES</button></div></div>`,
      },
    ],
  },
  c_intercept: {
    title: "INTERCEPTION",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;"><img src="assets/17.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.35;" /><h1 style="font-family:'Bebas Neue'; font-size:140px; color:var(--police-red); letter-spacing:10px;">INTERCEPTÉS</h1><p style="font-size:30px;">La course s'arrête ici.</p><button class="choice-btn red" style="width:420px; margin-top:50px;" onclick="resetGame()">RECOMMENCER</button></div>`,
      },
    ],
  },
  c_8_force: {
    title: "PIED AU PLANCHER",
    grid: "grid-2",
    next: "c_9",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/01.webp" /><img src="assets/hono/3.webp" style="position:absolute; bottom:-45px; right:-30px; width:480px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(11deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/01.webp" /><div class="caption" style="top:30px; left:30px;">La police ne suit pas le rythme délirant de la RX7 !</div>`,
      },
    ],
  },
  c_8_stealth: {
    title: "RUELLES",
    grid: "grid-2",
    next: "c_9",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/18.webp" /><img src="assets/hono/4.webp" style="position:absolute; bottom:-35px; right:-20px; width:400px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(7deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/19.webp" /><div class="caption" style="top:30px; left:30px;">Vous semez les flics dans les ruelles et retournez sur la course.</div>`,
      },
    ],
  },
  c_9: {
    title: "DANS LE RÉTRO",
    grid: "grid-3-row",
    next: "c_10",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/20.webp" /><div class="bubble evil" style="bottom:30px; left:30px;">Les flics m'ont loupé, t'es mort Karim !</div>`,
      },
      { delay: 200, html: `<img src="assets/21.webp" />` },
      {
        delay: 400,
        html: `<img src="assets/22.webp" /><div class="caption" style="top:30px; left:30px;">Samy n'a pas lâché.</div>`,
      },
    ],
  },
  c_10: {
    title: "TRAFIC ARRIVE",
    grid: "grid-asym",
    next: "c_11",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/23bis.webp" /><div class="caption" style="top:20px; left:20px;">Un mur de voitures de nuit apparaît au loin.</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/24.webp" /><div class="bubble" style="bottom:20px; right:20px;">Ça va se jouer au slalom pur...</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/25.webp" /><img src="assets/hono/5.webp" style="position:absolute; top:-30px; left:-20px; width:420px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-8deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },
  c_11: {
    title: "LE SLALOM",
    grid: "grid-hero",
    next: "final_choice",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/26.webp" /><img src="assets/hono/6.webp" style="position:absolute; top:30%; left:-35px; width:540px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-6deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },

  /* ====== PATH 3: RESPECT ====== */
  r_4: {
    title: "LA FOULE EN DÉLIRE",
    grid: "grid-asym",
    next: "r_5",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/07.webp" /><img src="assets/hono/7.webp" style="position:absolute; top:-45px; left:-25px; width:510px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-12deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/08.webp" /><div class="caption" style="top:20px; left:20px;">Enjeu : {bet} total du quartier.</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/09.webp" /><div class="bubble" style="bottom:20px; right:20px;">On va leur donner le show de leur vie.</div>`,
      },
    ],
  },
  r_5: {
    title: "LA GRILLE",
    grid: "grid-hero",
    isRaceStart: true,
    hideNav: true,
    next: "r_accel",
    html: raceStartHTML,
  },
  r_accel: {
    title: "DÉPART ARRÊTÉ",
    grid: "grid-3-mos",
    next: "r_6",
    panels: sharedAccelPanels,
  },
  r_6: {
    title: "TANDEM DRIFT",
    grid: "grid-3-mos",
    next: "r_7",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/34.webp" /><img src="assets/hono/8.webp" style="position:absolute; top:-35px; right:-25px; width:470px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(12deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/200.webp" /><div class="caption" style="top:20px; left:20px;">Premier virage pris à l'équerre !</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/22.webp" /><div class="bubble" style="bottom:20px; right:20px;">La fumée des pneus envahit la piste.</div>`,
      },
    ],
  },
  r_7: {
    title: "L'ANGLE PARFAIT",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div class="choice-wrapper"><h2 class="choice-title">L'ÉPINGLE À CHEVEUX APPROCHE</h2><div class="choice-container"><button class="choice-btn" onclick="goTo('r_8_mur')">RASER LE MUR</button><button class="choice-btn blue" onclick="goTo('r_8_grip')">LIGNE INTÉRIEURE</button></div></div>`,
      },
    ],
  },
  r_8_mur: {
    title: "WALL TAP !",
    grid: "grid-2",
    next: "r_10",
    panels: [
      { delay: 0, html: `<img src="assets/49.webp" />` },
      {
        delay: 200,
        html: `<img src="assets/56.webp" /><div class="bubble" style="top:30px; left:30px;">Le pare-choc embrasse le béton !</div><div class="caption" style="bottom:30px; right:30px;">Le public hurle. Masterclass.</div>`,
      },
    ],
  },
  r_8_grip: {
    title: "TRAJECTOIRE PROPRE",
    grid: "grid-2",
    next: "r_10",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/61.webp" /><img src="assets/hono/9.webp" style="position:absolute; bottom:-45px; right:-30px; width:480px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(9deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/62.webp" /><div class="caption" style="top:30px; left:30px;">Tu ressors comme une balle et prends 5 mètres d'avance.</div>`,
      },
    ],
  },

  r_10: {
    title: "CÔTE À CÔTE",
    grid: "grid-asym",
    next: "r_11",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/57.webp" /><div class="caption" style="top:20px; left:20px;">Portière contre portière dans l'ultime ligne droite.</div>`,
      },
      {
        delay: 200,
        html: `<img src="assets/58.webp" /><div class="bubble" style="bottom:20px; right:20px;">Le moteur est au rupteur !</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/59.webp" /><img src="assets/hono/1.webp" style="position:absolute; top:-25px; left:5px; width:400px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-7deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },
  r_11: {
    title: "DERNIERS MÈTRES",
    grid: "grid-hero",
    next: "final_choice",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/60.webp" /><img src="assets/hono/2.webp" style="position:absolute; top:28%; left:-35px; width:560px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-5deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
    ],
  },

  /* ====== UNIVERSAL ENDING CHOICES ====== */
  final_choice: {
    title: "CHOIX 2 : VIRAGE SERRÉ",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<img src="assets/27.webp"/><div class="choice-wrapper"><h2 class="choice-title" style="font-size: 80px;">CHOIX 2 : VIRAGE SERRÉ</h2><div class="choice-container" style="gap: 20px;"><button class="choice-btn red" onclick="goTo('crash_1')">CONTINUER D'ACCÉLÉRER ET DRIFTER</button><button class="choice-btn blue" onclick="goTo('final_drift')">FREINER ET DRIFTER</button></div></div>`,
      },
    ],
  },
  final_drift: {
    title: "DRIFT CONTRÔLÉ",
    grid: "grid-hero",
    next: "retro_choice",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/49.webp" /><img src="assets/hono/6.webp" style="position:absolute; top:28%; left:-35px; width:560px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-5deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" /><div class="caption" style="top:20px; left:20px;">Tu plantes les freins, l'arrière décroche et la voiture se cale en drift.</div><div class="bubble" style="bottom:20px; right:20px;">Ça passe... mais au millimètre.</div>`,
      },
    ],
  },
  retro_choice: {
    title: "CHOIX 3 : RÉTRO GAUCHE",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<img src="assets/29.webp" /><div class="choice-wrapper"><h2 class="choice-title" style="font-size: 72px;">DERNIÈRE LIGNE DROITE</h2><div class="choice-container" style="gap: 20px;"><button class="choice-btn" onclick="goTo('win_1')">SE RESSERRER VERS LA GAUCHE</button><button class="choice-btn blue" onclick="goTo('lose_1')">METTRE LE PIEDS SUR LE PLANCHER</button></div></div>`,
      },
    ],
  },

  /* ====== ENDINGS ====== */
  win_1: {
    title: "RÉSULTAT",
    grid: "grid-asym",
    next: "win_2",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/30.webp" /><img src="assets/hono/3.webp" style="position:absolute; top:-40px; left:-25px; width:490px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-10deg); filter:drop-shadow(0 0 20px rgba(255,69,0,0.8));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/31.webp" /><div class="caption" style="top:20px; left:20px;">Tu te resserres à gauche et bloques le dépassement.</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/32.webp" /><div class="bubble" style="bottom:20px; right:20px;">Ciao Samy.</div>`,
      },
    ],
  },
  win_2: {
    title: "LIGNE D'ARRIVÉE",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<img src="assets/32.webp" /><div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;"><img src="assets/01.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.3;" /><h1 style="font-family:'Bebas Neue'; font-size:150px; color:var(--neon-orange); animation: pulseNeon 2s infinite; letter-spacing:10px;">1ER</h1><p style="font-size:30px;">Tu as sécurisé : <span style="color:var(--electric-blue); font-weight:bold;">{bet}</span></p><p style="margin-top:20px; font-size:24px; color:#aaa;">Tu empêches le dépassement au rétro gauche.</p><button class="choice-btn" style="width:400px; margin-top:60px;" onclick="resetGame()">REJOUER L'HISTOIRE</button></div>`,
      },
    ],
  },

  lose_1: {
    title: "RÉSULTAT",
    grid: "grid-asym",
    next: "lose_2",
    panels: [
      {
        delay: 0,
        html: `<img src="assets/34.webp" /><img src="assets/hono/4.webp" style="position:absolute; top:-40px; left:-25px; width:500px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-11deg); filter:drop-shadow(0 0 20px rgba(0,229,255,0.85));" />`,
      },
      {
        delay: 200,
        html: `<img src="assets/35.webp" /><div class="caption" style="top:20px; left:20px;">Pied au plancher, mais il te dépasse dans la dernière ligne droite.</div>`,
      },
      {
        delay: 400,
        html: `<img src="assets/36.webp" /><div class="bubble" style="bottom:20px; right:20px;">Pas cette fois...</div>`,
      },
    ],
  },
  lose_2: {
    title: "2ÈME PLACE",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;"><img src="assets/37.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:0; opacity:0.45;" /><div style="position:absolute; inset:0; background:rgba(5,5,5,0.65); z-index:1;"></div><h1 style="position:relative; z-index:2; font-family:'Bebas Neue'; font-size:150px; color:#bbb; letter-spacing:10px;">2ÈME</h1><p style="position:relative; z-index:2; font-size:30px;">Il te dépasse, tu termines derrière.</p><p style="position:relative; z-index:2; margin-top:20px; font-size:24px; color:#888;">Mise : <span style="color:var(--neon-orange); font-weight:bold;">{bet}</span></p><button class="choice-btn" style="position:relative; z-index:2; width:400px; margin-top:60px; border-color:#444;" onclick="resetGame()">RETOURNER AU GARAGE</button></div>`,
      },
    ],
  },

  crash_1: {
    title: "RÉSULTAT",
    grid: "grid-hero",
    next: "crash_2",
    panels: [
      {
        delay: 0,
        html: `<div style="width:100%; height:100%; background:white; position:relative;"><img src="assets/28.webp" /><img src="assets/hono/5.webp" style="position:absolute; top:28%; left:18%; width:580px; height:auto; animation:none; z-index:20; pointer-events:none; transform:rotate(-5deg); filter:drop-shadow(0 0 25px rgba(255,0,60,0.95));" /></div>`,
      },
    ],
  },
  crash_2: {
    title: "GAME OVER",
    grid: "grid-hero",
    hideNav: true,
    panels: [
      {
        delay: 0,
        html: `<div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#200; position:relative;"><img src="assets/01.webp" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:-1; opacity:0.4; filter:grayscale(100%) sepia(100%) hue-rotate(-50deg);" /><h1 style="font-family:'Bebas Neue'; font-size:150px; color:red; letter-spacing:10px;">ÉPAVE</h1><p style="font-size:30px;">Virage serré raté. Fumée partout.</p><p style="margin-top:20px; font-style:italic; font-size:24px; color:#ccc;">Adieu <span style="font-weight:bold;">{bet}</span>...</p><button class="choice-btn red" style="width:400px; margin-top:60px;" onclick="resetGame()">APPELER LA DÉPANNEUSE</button></div>`,
      },
    ],
  },
};

/* ================= LOGIC & RENDERING ================= */
const renderArea = document.getElementById("render-area");
const gameContainer = document.getElementById("game-container");
const hud = document.getElementById("hud");
const controls = document.getElementById("controls");
const wipeEl = document.getElementById("wipe");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

let scrollDownAccumulator = 0;
let scrollUpAccumulator = 0;
let lastScrollNextAt = 0;
let lastScrollBackAt = 0;
const SCROLL_NEXT_THRESHOLD = 100;
const SCROLL_NEXT_COOLDOWN_MS = 450;

function initGame() {
  buildProgressDiamonds();
  renderScene("title");
}

function buildProgressDiamonds() {
  const pb = document.getElementById("progress-bar");
  pb.innerHTML = "";
  for (let i = 1; i < totalEpisodes; i++) {
    let d = document.createElement("div");
    d.className = "diamond";
    pb.appendChild(d);
  }
}

// Fonction pour attacher les event listeners hover sur tous les boutons
function attachHoverSounds() {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", playHoverSound);
  });
}

function updateHUD(nodeId) {
  if (nodeId === "title") {
    hud.style.opacity = 0;
    controls.style.display = "none";
  } else {
    hud.style.opacity = 1;
    const scene = storyGraph[nodeId];
    const epNum = historyStack.length - 1;

    document.getElementById("scene-name").innerText =
      `EP ${epNum} - ${scene.title}`;

    document.querySelectorAll(".diamond").forEach((d, idx) => {
      if (idx < epNum) d.classList.add("active");
      else d.classList.remove("active");
    });

    gameState.viewBoost += 75;
    let viewers = 1400 + epNum * 250 + gameState.viewBoost;
    document.getElementById("viewers").innerHTML =
      `<span class="live-dot">●</span> ${viewers} VIEWERS`;

    controls.style.display = scene.hideNav ? "none" : "flex";
    btnPrev.disabled = historyStack.length <= 2;
  }
}

function parseText(text) {
  return text.replace(/{bet}/g, gameState.bet);
}

function renderScene(nodeId) {
  // Nettoyage sécurité du timer et statut Z
  clearInterval(countdownTimer);
  isWaitingForZ = false;

  const scene = storyGraph[nodeId];
  updateHUD(nodeId);

  // Jouer le son gameover pour les trois scènes de défaite
  if (nodeId === "c_intercept" || nodeId === "lose_2" || nodeId === "crash_2") {
    playGameoverSound();
  }

  // Stopper le son accel aux scènes de choix après l'accélération
  if (nodeId === "m_7" || nodeId === "c_7" || nodeId === "r_7") {
    stopAccelSound();
  }

  wipeEl.classList.remove("do-wipe", "do-flash");
  void wipeEl.offsetWidth;
  wipeEl.classList.add(historyStack.length % 2 === 0 ? "do-wipe" : "do-flash");

  setTimeout(() => {
    renderArea.innerHTML = "";
    const container = document.createElement("div");
    container.className = `scene-container active ${scene.grid}`;

    if (scene.html) {
      const panel = document.createElement("div");
      panel.className = "panel";
      panel.style.animation = "none";
      panel.style.border = "none";
      panel.style.boxShadow = "none";
      panel.style.background = "transparent";
      panel.style.opacity = "1";
      panel.style.transform = "none";
      panel.innerHTML = parseText(scene.html);
      container.appendChild(panel);
    } else if (scene.panels) {
      scene.panels.forEach((p) => {
        const panel = document.createElement("div");
        panel.className = "panel";
        panel.style.animationDelay = `${p.delay}ms`;
        const parsedHtml = parseText(p.html);
        if (parsedHtml.includes('assets/hono/')) {
          panel.style.overflow = 'hidden';
          panel.innerHTML = `<div class="panel-content">${parsedHtml}</div>`;
        } else {
          panel.innerHTML = `<div class="panel-content">${parsedHtml}</div>`;
        }
        container.appendChild(panel);
      });
    }

    renderArea.appendChild(container);

    // Attacher les sons hover sur tous les boutons
    attachHoverSounds();

    // Garde toutes les onomatopées dans le cadre des vignettes.
    container
      .querySelectorAll('.panel-content img[src*="assets/hono/"]')
      .forEach((img) => {
        img.style.top = "6%";
        img.style.left = "6%";
        img.style.right = "auto";
        img.style.bottom = "auto";
        img.style.width = "46%";
        img.style.height = "auto";
        img.style.maxHeight = "88%";
        img.style.objectFit = "contain";
        img.style.transform = "rotate(-6deg)";
        img.style.zIndex = "6";
      });

    if (scene.isRaceStart) {
      let count = 3;
      const cdText = document.getElementById("countdown-text");
      const zPrompt = document.getElementById("z-prompt");
      const clickZone = document.getElementById("race-click-zone");
      const raceBg = document.getElementById("race-bg");

      if (raceBg) {
        // Lance la montée d'opacité juste après le rendu du DOM.
        requestAnimationFrame(() => {
          raceBg.style.opacity = "1";
        });
      }

      // Jouer le son 321 complet immédiatement au démarrage
      play321Sound();

      countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          cdText.innerText = count;
          cdText.style.animation = "none";
          void cdText.offsetWidth;
          cdText.style.animation = "popIn 0.5s ease-out";
          if (count === 1)
            cdText.style.textShadow = "0 0 50px var(--neon-orange)";
        } else {
          clearInterval(countdownTimer);
          cdText.innerText = "GO !!!";
          cdText.style.textShadow = "0 0 50px var(--electric-blue)";
          cdText.style.animation = "pulseBlue 0.5s infinite alternate";
          zPrompt.style.opacity = 1;
          isWaitingForZ = true;

          clickZone.onclick = function () {
            if (isWaitingForZ) {
              isWaitingForZ = false;
              triggerRaceStart(scene.next);
            }
          };
        }
      }, 1000);
    }
  }, 400);
}

function triggerRaceStart(nextSceneId) {
  playAccelSound();
  wipeEl.classList.remove("do-flash", "do-wipe");
  void wipeEl.offsetWidth;
  wipeEl.classList.add("do-flash");
  setTimeout(() => goTo(nextSceneId), 150);
}

window.goTo = function (nextNodeId) {
  historyStack.push(nextNodeId);
  renderScene(nextNodeId);
};
window.goBack = function () {
  if (historyStack.length > 2) {
    historyStack.pop();
    renderScene(historyStack[historyStack.length - 1]);
  }
};
window.setVar = function (key, val) {
  gameState[key] = val;
};
window.resetGame = function () {
  gameState = { bet: "", viewBoost: 0 };
  historyStack = ["title"];
  renderScene("title");
};

btnNext.addEventListener("click", () => {
  const nextId = storyGraph[historyStack[historyStack.length - 1]].next;
  if (nextId) goTo(nextId);
});
btnPrev.addEventListener("click", goBack);

document.addEventListener("keydown", (e) => {
  const currentId = historyStack[historyStack.length - 1];
  const scene = storyGraph[currentId];

  if (isWaitingForZ && (e.key === "z" || e.key === "Z")) {
    isWaitingForZ = false;
    triggerRaceStart(scene.next);
    return;
  }

  if (!scene.hideNav && !scene.isRaceStart) {
    if (e.key === "ArrowRight" && scene.next) goTo(scene.next);
    if (e.key === "ArrowLeft") goBack();
  }
});

gameContainer.addEventListener(
  "wheel",
  (e) => {
    const currentId = historyStack[historyStack.length - 1];
    const scene = storyGraph[currentId];
    if (!scene || scene.hideNav || scene.isRaceStart) return;

    const now = Date.now();
    if (
      now - lastScrollNextAt < SCROLL_NEXT_COOLDOWN_MS ||
      now - lastScrollBackAt < SCROLL_NEXT_COOLDOWN_MS
    ) {
      e.preventDefault();
      return;
    }

    if (e.deltaY > 0) {
      if (!scene.next) return;

      scrollDownAccumulator += e.deltaY;
      scrollUpAccumulator = 0;
      e.preventDefault();

      if (scrollDownAccumulator >= SCROLL_NEXT_THRESHOLD) {
        scrollDownAccumulator = 0;
        lastScrollNextAt = now;
        goTo(scene.next);
      }
      return;
    }

    if (e.deltaY < 0) {
      scrollUpAccumulator += -e.deltaY;
      scrollDownAccumulator = 0;
      e.preventDefault();

      if (scrollUpAccumulator >= SCROLL_NEXT_THRESHOLD) {
        scrollUpAccumulator = 0;
        lastScrollBackAt = now;
        goBack();
      }
    }
  },
  { passive: false }
);

initGame();


