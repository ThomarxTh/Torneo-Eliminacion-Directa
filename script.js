let players = [];
let historyStack = [];

function addPlayer() {
    const input = document.getElementById('playerInput');
    const val = input.value.trim();
    if (val && players.length < 16) {
        players.push(val);
        input.value = '';
        renderSidebar();
    }
}

function renderSidebar() {
    document.getElementById('playersAddedList').innerHTML = players.map((p, idx) => `<li>${idx + 1}. ${p}</li>`).join('');
    document.getElementById('playerCount').innerText = `(${players.length} / 16)`;
}

function startTournament() {
    if (players.length !== 16) return alert("Ingresa los 16 jugadores.");
    let shuffled = [...players].sort(() => Math.random() - 0.5);
    historyStack = [];
    buildBracket(shuffled);
}

function buildBracket(shuffled) {
    const grid = document.getElementById('mainBracket');
    grid.innerHTML = "";

    const config = [
        { label: "Octavos", matches: 4, id: "L1", data: shuffled.slice(0, 8) },
        { label: "Cuartos", matches: 2, id: "L2", data: null },
        { label: "Semis",   matches: 1, id: "L3", data: null },
        { label: "FINAL",   matches: 1, id: "FINAL", data: null, isFinal: true },
        { label: "Semis",   matches: 1, id: "R3", data: null },
        { label: "Cuartos", matches: 2, id: "R2", data: null },
        { label: "Octavos", matches: 4, id: "R1", data: shuffled.slice(8, 16) }
    ];

    config.forEach((colData, colIndex) => {
        const colDiv = document.createElement('div');
        colDiv.className = `column col-${colIndex} ${colData.isFinal ? 'center-col' : ''}`;
        
        if (colData.isFinal) {
            colDiv.innerHTML = `<div class="trophy">🏆</div><h2 class="bracket-label" style="color:var(--vlr-gold)">GRAN FINAL</h2>`;
            const card = createMatchCard("final-match", "FINAL", 0, null);
            card.classList.add('final-card');
            colDiv.appendChild(card);
        } else {
            colDiv.innerHTML = `<h2 class="bracket-label">${colData.label}</h2>`;
            for (let i = 0; i < colData.matches; i++) {
                const pData = colData.data ? [colData.data[i*2], colData.data[i*2+1]] : ["---", "---"];
                colDiv.appendChild(createMatchCard(`${colData.id}-m${i}`, colData.id, i, pData));
            }
        }
        grid.appendChild(colDiv);
    });
}

function createMatchCard(id, roundId, matchIdx, pData) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.id = id;
    const p1 = pData ? pData[0] : "---";
    const p2 = pData ? pData[1] : "---";
    card.innerHTML = `
        <div class="team-slot ${p1==='---'?'empty':''}" onclick="advance(this,'${roundId}',${matchIdx},0)">${p1}</div>
        <div class="team-slot ${p2==='---'?'empty':''}" onclick="advance(this,'${roundId}',${matchIdx},1)">${p2}</div>
    `;
    return card;
}

function advance(el, rid, midx, sidx) {
    const name = el.innerText;
    if (name === "---") return;

    // --- BLOQUEO DE SEGURIDAD ---
    const matchCard = el.parentElement;
    const player1 = matchCard.children[0].innerText;
    const player2 = matchCard.children[1].innerText;

    if (player1 === "---" || player2 === "---") {
        alert("¡Espera! Este jugador aún no tiene rival en este partido.");
        return;
    }
    // ----------------------------

    saveHistory();

    let targetId = "";
    let nextSidx = midx % 2;
    let nextMidx = Math.floor(midx / 2);

    if (rid === "L1") targetId = `L2-m${nextMidx}`;
    else if (rid === "L2") targetId = `L3-m${nextMidx}`;
    else if (rid === "L3") { targetId = "final-match"; nextSidx = 0; }
    else if (rid === "R1") targetId = `R2-m${nextMidx}`;
    else if (rid === "R2") targetId = `R3-m${nextMidx}`;
    else if (rid === "R3") { targetId = "final-match"; nextSidx = 1; }
    else if (rid === "FINAL") { 
        alert("🏆 ¡TH'S CHAMPION!: " + name.toUpperCase()); 
        return; 
    }

    const tMatch = document.getElementById(targetId);
    if (tMatch) {
        const slot = tMatch.children[nextSidx];
        slot.innerText = name;
        slot.classList.remove('empty');
    }

    // Efecto visual de "ganador"
    matchCard.style.opacity = "0.4";
    matchCard.style.pointerEvents = "none";
    el.style.color = "var(--vlr-green)";
}

function saveHistory() { historyStack.push(document.getElementById('mainBracket').innerHTML); }
function undoAction() { if (historyStack.length > 0) document.getElementById('mainBracket').innerHTML = historyStack.pop(); }
function resetTournament() { if (confirm("¿Resetear?")) { players = []; renderSidebar(); document.getElementById('mainBracket').innerHTML = ""; } }