const API_BASE = "https://pokeapi.co/api/v2";
const MAX_POKEMON_ID = 386;

const state = {
    team: [],
    activePokemonIndex: 0,

    enemy: null,

    round: 1,

    rollingCount: 0,

    battleLocked: false,

    replacementAvailable: false
};


/* =========================
   ELEMENTOS DA INTERFACE
========================= */

const screens = {
    home: document.getElementById("home-screen"),
    pregame: document.getElementById("pregame-screen"),
    game: document.getElementById("game-screen")
};

const homeStart = document.getElementById("home-start");

const rollButton = document.getElementById("roll-button");
const pregameStart = document.getElementById("pregame-start");

const teamSlots = document.getElementById("team-slots");
const rollMessage = document.getElementById("roll-message");

const loading = document.getElementById("loading");

const battleTeam = document.getElementById("battle-team");

const roundNumber = document.getElementById("round-number");
const teamCount = document.getElementById("team-count");

const battleMessage = document.getElementById("battle-message");

const enemyName = document.getElementById("enemy-name");
const enemyLevel = document.getElementById("enemy-level");
const enemySprite = document.getElementById("enemy-sprite");
const enemyHpBar = document.getElementById("enemy-hp-bar");
const enemyHpText = document.getElementById("enemy-hp-text");

const playerName = document.getElementById("player-name");
const playerLevel = document.getElementById("player-level");
const playerSprite = document.getElementById("player-sprite");
const playerHpBar = document.getElementById("player-hp-bar");
const playerHpText = document.getElementById("player-hp-text");

const terminalLog = document.getElementById("terminal-log");
const movesContainer = document.getElementById("moves");

const postBattle = document.getElementById("post-battle");
const postTitle = document.getElementById("post-title");
const postMessage = document.getElementById("post-message");
const postActions = document.getElementById("post-actions");


/* =========================
   EVENTOS
========================= */

homeStart.addEventListener("click", () => {

    showScreen("pregame");

});


rollButton.addEventListener("click", async () => {

    await rollPokemon();

});


pregameStart.addEventListener("click", async () => {

    if (state.team.length !== 3) {
        return;
    }

    showScreen("game");

    await startRound();

});


/* =========================
   TROCAR DE TELA
========================= */

function showScreen(screenName) {

    Object.values(screens).forEach(screen => {

        screen.classList.remove("active");

    });


    screens[screenName].classList.add("active");

}


/* =========================
   LOADING
========================= */

function showLoading(show) {

    loading.classList.toggle(
        "hidden",
        !show
    );

}


/* =========================
   POKÉMON ALEATÓRIO
========================= */

function getRandomPokemonId() {

    return Math.floor(
        Math.random() * MAX_POKEMON_ID
    ) + 1;

}


/* =========================
   BUSCAR POKÉMON NA API
========================= */

async function fetchPokemon(id) {

    const response = await fetch(
        `${API_BASE}/pokemon/${id}`
    );


    if (!response.ok) {

        throw new Error(
            "Não foi possível carregar o Pokémon."
        );

    }


    const data = await response.json();


    return formatPokemon(data);

}


/* =========================
   FORMATAR POKÉMON
========================= */

function formatPokemon(data) {

    const attack = getStat(
        data,
        "attack"
    );

    const defense = getStat(
        data,
        "defense"
    );

    const speed = getStat(
        data,
        "speed"
    );

    const hp = getStat(
        data,
        "hp"
    );


    const moves = data.moves
        .filter(move => move.move.url)
        .slice(0, 20);


    return {

        id: data.id,

        name: capitalize(
            data.name
        ),

        level: 5,

        spriteFront:
            data.sprites.front_default,

        spriteBack:
            data.sprites.back_default ||
            data.sprites.front_default,

        stats: {

            hp: hp,

            maxHp: hp,

            attack: attack,

            defense: defense,

            speed: speed

        },

        currentHp: hp,

        moves: moves,

        selectedMoves: []

    };

}


/* =========================
   PEGAR STATUS
========================= */

function getStat(data, statName) {

    const stat = data.stats.find(
        item =>
            item.stat.name === statName
    );


    return stat
        ? stat.base_stat
        : 1;

}


/* =========================
   CAPITALIZAR NOME
========================= */

function capitalize(text) {

    return text
        .charAt(0)
        .toUpperCase() +
        text.slice(1);

}


/* =========================
   ROLAR POKÉMON
========================= */

async function rollPokemon() {

    if (state.rollingCount >= 3) {
        return;
    }


    rollButton.disabled = true;

    showLoading(true);


    try {

        const id =
            getRandomPokemonId();


        const pokemon =
            await fetchPokemon(id);


        state.team.push(pokemon);

        state.rollingCount++;


        renderTeamSlots();


        rollMessage.textContent =
            `${pokemon.name} entrou para sua equipe.`;


        if (state.rollingCount === 3) {

            rollButton.disabled = true;

            pregameStart.classList.remove(
                "hidden"
            );


            rollMessage.textContent =
                "Equipe completa. Prepare-se para a batalha.";

        } else {

            rollButton.disabled = false;

        }

    } catch (error) {

        console.error(error);

        rollMessage.textContent =
            "Erro ao carregar o Pokémon. Tente novamente.";

        rollButton.disabled = false;

    } finally {

        showLoading(false);

    }

}


/* =========================
   RENDERIZAR SLOTS
========================= */

function renderTeamSlots() {

    const slots =
        teamSlots.querySelectorAll(
            ".team-slot"
        );


    slots.forEach((slot, index) => {

        const pokemon =
            state.team[index];


        if (!pokemon) {

            slot.classList.add("empty");

            slot.classList.remove("filled");


            slot.innerHTML = `

                <span>
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div>
                    ?
                </div>

            `;

            return;

        }


        slot.classList.remove("empty");

        slot.classList.add("filled");


        slot.innerHTML = `

            <span>
                ${String(index + 1).padStart(2, "0")}
            </span>

            <img
                src="${pokemon.spriteFront}"
                alt="${pokemon.name}"
            >

            <strong>
                ${pokemon.name}
            </strong>

            <small>
                HP ${pokemon.currentHp}/${pokemon.stats.maxHp}
            </small>

        `;

    });

}


/* =========================
   INICIAR RODADA
========================= */

async function startRound() {

    state.battleLocked = false;

    postBattle.classList.add("hidden");


    roundNumber.textContent =
        state.round;


    updateTeamCount();


    showLoading(true);


    try {

        const enemyId =
            getRandomPokemonId();


        state.enemy =
            await fetchPokemon(enemyId);


        state.enemy.level =
            5 + Math.floor(
                state.round / 2
            );


        state.enemy.currentHp =
            state.enemy.stats.maxHp;


        state.team.forEach(pokemon => {

            if (
                pokemon.currentHp <= 0
            ) {

                pokemon.currentHp =
                    pokemon.stats.maxHp;

            }

        });


        const active =
            getActivePokemon();


        if (!active ||
            active.currentHp <= 0) {

            const nextIndex =
                findNextAlivePokemon();


            if (nextIndex !== -1) {

                state.activePokemonIndex =
                    nextIndex;

            }

        }


        renderBattle();


        battleMessage.textContent =
            `Um ${state.enemy.name} selvagem apareceu!`;


        terminalLog.textContent =
            "Escolha um ataque.";


        await prepareMoves(
            getActivePokemon()
        );


        if (
            state.enemy.stats.speed >
            getActivePokemon().stats.speed
        ) {

            battleMessage.textContent =
                `${state.enemy.name} é mais rápido!`;

            await enemyTurn();

        }

    } catch (error) {

        console.error(error);

        battleMessage.textContent =
            "Erro ao iniciar a rodada.";

    } finally {

        showLoading(false);

    }

}


/* =========================
   POKÉMON ATIVO
========================= */

function getActivePokemon() {

    return state.team[
        state.activePokemonIndex
    ];

}


/* =========================
   ENCONTRAR POKÉMON VIVO
========================= */

function findNextAlivePokemon() {

    return state.team.findIndex(
        pokemon =>
            pokemon.currentHp > 0
    );

}


/* =========================
   CONTAR POKÉMON VIVOS
========================= */

function getAliveCount() {

    return state.team.filter(
        pokemon =>
            pokemon.currentHp > 0
    ).length;

}


/* =========================
   RENDERIZAR BATALHA
========================= */

function renderBattle() {

    renderBattleTeam();

    renderActivePokemon();

    renderEnemy();

    updateTeamCount();

}


/* =========================
   RENDERIZAR EQUIPE
========================= */

function renderBattleTeam() {

    battleTeam.innerHTML = "";


    state.team.forEach(
        (pokemon, index) => {

            const card =
                document.createElement("div");


            card.className =
                "battle-team-card";


            if (
                index ===
                state.activePokemonIndex
            ) {

                card.classList.add(
                    "active"
                );

            }


            if (
                pokemon.currentHp <= 0
            ) {

                card.classList.add(
                    "fainted"
                );

            }


            const hpPercentage =
                Math.max(
                    0,
                    pokemon.currentHp /
                    pokemon.stats.maxHp *
                    100
                );


            card.innerHTML = `

                <strong>
                    ${pokemon.name}
                </strong>

                <img
                    src="${pokemon.spriteFront}"
                    alt="${pokemon.name}"
                >

                <div class="mini-hp">

                    <div
                        style="width: ${hpPercentage}%"
                    ></div>

                </div>

                <small>
                    ${pokemon.currentHp}/${pokemon.stats.maxHp} HP
                </small>

            `;


            card.addEventListener(
                "click",
                () => {

                    if (
                        state.battleLocked
                    ) {
                        return;
                    }


                    if (
                        index ===
                        state.activePokemonIndex
                    ) {
                        return;
                    }


                    if (
                        pokemon.currentHp <= 0
                    ) {
                        return;
                    }


                    switchPokemon(
                        index
                    );

                }
            );


            battleTeam.appendChild(
                card
            );

        }
    );

}


/* =========================
   RENDERIZAR JOGADOR
========================= */

function renderActivePokemon() {

    const pokemon =
        getActivePokemon();


    if (!pokemon) {
        return;
    }


    playerName.textContent =
        pokemon.name;


    playerLevel.textContent =
        `LV ${pokemon.level}`;


    playerSprite.src =
        pokemon.spriteBack;


    playerSprite.alt =
        pokemon.name;


    updatePlayerHp();

}


/* =========================
   RENDERIZAR INIMIGO
========================= */

function renderEnemy() {

    if (!state.enemy) {
        return;
    }


    enemyName.textContent =
        state.enemy.name;


    enemyLevel.textContent =
        `LV ${state.enemy.level}`;


    enemySprite.src =
        state.enemy.spriteFront;


    enemySprite.alt =
        state.enemy.name;


    updateEnemyHp();

}


/* =========================
   ATUALIZAR HP DO JOGADOR
========================= */

function updatePlayerHp() {

    const pokemon =
        getActivePokemon();


    if (!pokemon) {
        return;
    }


    const percentage =
        Math.max(
            0,
            pokemon.currentHp /
            pokemon.stats.maxHp *
            100
        );


    playerHpBar.style.width =
        `${percentage}%`;


    playerHpText.textContent =
        `${pokemon.currentHp} / ${pokemon.stats.maxHp} HP`;

}


/* =========================
   ATUALIZAR HP DO INIMIGO
========================= */

function updateEnemyHp() {

    if (!state.enemy) {
        return;
    }


    const percentage =
        Math.max(
            0,
            state.enemy.currentHp /
            state.enemy.stats.maxHp *
            100
        );


    enemyHpBar.style.width =
        `${percentage}%`;


    enemyHpText.textContent =
        `${state.enemy.currentHp} / ${state.enemy.stats.maxHp} HP`;

}


/* =========================
   ATUALIZAR CONTADOR
========================= */

function updateTeamCount() {

    teamCount.textContent =
        `${getAliveCount()}/3`;

}


/* =========================
   PREPARAR ATAQUES
========================= */

async function prepareMoves(pokemon) {

    movesContainer.innerHTML =
        "CARREGANDO ATAQUES...";


    if (
        !pokemon.selectedMoves ||
        pokemon.selectedMoves.length === 0
    ) {

        pokemon.selectedMoves =
            await getRandomMoves(
                pokemon.moves
            );

    }


    renderMoves(
        pokemon.selectedMoves
    );

}


/* =========================
   BUSCAR ATAQUES
========================= */

async function getRandomMoves(
    moves
) {

    const shuffled =
        [...moves].sort(
            () => Math.random() - 0.5
        );


    const selected =
        shuffled.slice(0, 4);


    const result = [];


    for (const moveData of selected) {

        try {

            const response =
                await fetch(
                    moveData.move.url
                );


            const data =
                await response.json();


            if (
                !data.power ||
                data.power <= 0
            ) {
                continue;
            }


            result.push({

                name:
                    capitalize(
                        data.name
                    ),

                power:
                    data.power

            });


        } catch (error) {

            console.error(
                "Erro ao carregar ataque:",
                error
            );

        }

    }


    if (result.length === 0) {

        return [

            {
                name: "Tackle",
                power: 40
            },

            {
                name: "Scratch",
                power: 40
            },

            {
                name: "Quick Attack",
                power: 40
            },

            {
                name: "Bite",
                power: 60
            }

        ];

    }


    return result.slice(0, 4);

}


/* =========================
   RENDERIZAR ATAQUES
========================= */

function renderMoves(moves) {

    movesContainer.innerHTML = "";


    moves.forEach(
        (move, index) => {

            const button =
                document.createElement("button");


            button.className =
                "move-button";


            button.innerHTML = `

                ${move.name}

                <small>
                    POWER: ${move.power}
                </small>

            `;


            button.addEventListener(
                "click",
                () => {

                    playerAttack(
                        index
                    );

                }
            );


            movesContainer.appendChild(
                button
            );

        }
    );

}


/* =========================
   DESABILITAR ATAQUES
========================= */

function disableMoves(disabled) {

    const buttons =
        movesContainer.querySelectorAll(
            "button"
        );


    buttons.forEach(button => {

        button.disabled =
            disabled;

    });

}


/* =========================
   ATAQUE DO JOGADOR
========================= */

async function playerAttack(
    moveIndex
) {

    if (state.battleLocked) {
        return;
    }


    if (!state.enemy) {
        return;
    }


    const player =
        getActivePokemon();


    if (!player) {
        return;
    }


    const move =
        player.selectedMoves[
            moveIndex
        ];


    if (!move) {
        return;
    }


    state.battleLocked = true;

    disableMoves(true);


    battleMessage.textContent =
        `${player.name} usou ${move.name}!`;


    await wait(500);


    const damage =
        calculateDamage(
            player,
            state.enemy,
            move
        );


    state.enemy.currentHp =
        Math.max(
            0,
            state.enemy.currentHp -
            damage
        );


    terminalLog.textContent =
        `${move.name} causou ${damage} de dano!`;


    updateEnemyHp();


    if (
        state.enemy.currentHp <= 0
    ) {

        await wait(700);

        await winBattle();

        return;

    }


    await wait(700);


    await enemyTurn();


    if (
        getActivePokemon().currentHp <= 0
    ) {

        await faintPlayer();

        return;

    }


    state.battleLocked = false;

    disableMoves(false);

}


/* =========================
   CÁLCULO DE DANO
========================= */

function calculateDamage(
    attacker,
    defender,
    move
) {

    const damage =
        move.power +
        attacker.stats.attack -
        defender.stats.defense;


    return Math.max(
        1,
        damage
    );

}


/* =========================
   TURNO DO INIMIGO
========================= */

async function enemyTurn() {

    if (!state.enemy) {
        return;
    }


    const enemy =
        state.enemy;


    const player =
        getActivePokemon();


    if (
        !player ||
        player.currentHp <= 0
    ) {
        return;
    }


    const moves =
        await getRandomMoves(
            enemy.moves
        );


    const move =
        moves[
            Math.floor(
                Math.random() *
                moves.length
            )
        ];


    battleMessage.textContent =
        `${enemy.name} usou ${move.name}!`;


    await wait(500);


    const damage =
        calculateDamage(
            enemy,
            player,
            move
        );


    player.currentHp =
        Math.max(
            0,
            player.currentHp -
            damage
        );


    terminalLog.textContent =
        `${enemy.name} causou ${damage} de dano!`;


    updatePlayerHp();

    renderBattleTeam();

}


/* =========================
   POKÉMON DESMAIOU
========================= */

async function faintPlayer() {

    const player =
        getActivePokemon();


    if (!player) {
        return;
    }


    battleMessage.textContent =
        `${player.name} foi derrotado!`;


    renderBattle();


    await wait(700);


    const nextIndex =
        findNextAlivePokemon();


    if (nextIndex === -1) {

        gameOver();

        return;

    }


    openForcedSwitch();

}


/* =========================
   TROCAR POKÉMON
========================= */

async function switchPokemon(
    index
) {

    if (
        index < 0 ||
        index >= state.team.length
    ) {
        return;
    }


    const pokemon =
        state.team[index];


    if (
        pokemon.currentHp <= 0
    ) {
        return;
    }


    state.activePokemonIndex =
        index;


    renderBattle();


    battleMessage.textContent =
        `Você enviou ${pokemon.name}!`;


    terminalLog.textContent =
        "O inimigo está preparando seu próximo ataque.";


    state.battleLocked = true;

    disableMoves(true);


    await wait(600);


    await enemyTurn();


    if (
        getActivePokemon().currentHp <= 0
    ) {

        await faintPlayer();

        return;

    }


    await prepareMoves(
        getActivePokemon()
    );


    state.battleLocked = false;

    disableMoves(false);

}


/* =========================
   TROCA FORÇADA
========================= */

function openForcedSwitch() {

    const available =
        state.team
            .map(
                (pokemon, index) => ({
                    pokemon,
                    index
                })
            )
            .filter(
                item =>
                    item.pokemon.currentHp > 0
            );


    postBattle.classList.remove(
        "hidden"
    );


    postTitle.textContent =
        "POKÉMON DERROTADO";


    postMessage.textContent =
        "Escolha outro Pokémon para continuar.";


    postActions.innerHTML = "";


    available.forEach(
        ({ pokemon, index }) => {

            const button =
                document.createElement("button");


            button.textContent =
                `USAR ${pokemon.name}`;


            button.addEventListener(
                "click",
                async () => {

                    postBattle.classList.add(
                        "hidden"
                    );


                    state.activePokemonIndex =
                        index;


                    renderBattle();


                    battleMessage.textContent =
                        `${pokemon.name} entrou na batalha!`;


                    await prepareMoves(
                        pokemon
                    );


                    state.battleLocked =
                        false;


                    disableMoves(false);

                }
            );


            postActions.appendChild(
                button
            );

        }
    );

}


/* =========================
   VITÓRIA
========================= */

async function winBattle() {

    state.battleLocked = true;


    disableMoves(true);


    battleMessage.textContent =
        `${state.enemy.name} foi derrotado!`;


    terminalLog.textContent =
        "VITÓRIA!";


    await wait(800);


    postBattle.classList.remove(
        "hidden"
    );


    postTitle.textContent =
        "VITÓRIA!";


    postMessage.textContent =
        `Você venceu a rodada ${state.round}.`;


    postActions.innerHTML = "";


    const nextButton =
        document.createElement("button");


    nextButton.textContent =
        "PRÓXIMA RODADA";


    nextButton.addEventListener(
        "click",
        async () => {

            postBattle.classList.add(
                "hidden"
            );


            await nextRound();

        }
    );


    postActions.appendChild(
        nextButton
    );


    if (
        state.round % 3 === 0
    ) {

        state.replacementAvailable =
            true;


        const replaceButton =
            document.createElement("button");


        replaceButton.textContent =
            "SUBSTITUIR POKÉMON";


        replaceButton.addEventListener(
            "click",
            () => {

                openReplacement();

            }
        );


        postActions.appendChild(
            replaceButton
        );

    }

}


/* =========================
   PRÓXIMA RODADA
========================= */

async function nextRound() {

    state.round++;


    state.enemy = null;


    state.team.forEach(
        pokemon => {

            if (
                pokemon.currentHp <= 0
            ) {

                pokemon.currentHp =
                    Math.floor(
                        pokemon.stats.maxHp *
                        0.5
                    );

            }

        }
    );


    await startRound();

}


/* =========================
   SUBSTITUIÇÃO DE POKÉMON
========================= */

function openReplacement() {

    postBattle.classList.remove(
        "hidden"
    );


    postTitle.textContent =
        "SUBSTITUIR POKÉMON";


    postMessage.textContent =
        "Escolha qual Pokémon será substituído.";


    postActions.innerHTML = "";


    state.team.forEach(
        (pokemon, index) => {

            const button =
                document.createElement("button");


            button.textContent =
                `SUBSTITUIR ${pokemon.name}`;


            button.addEventListener(
                "click",
                async () => {

                    await replacePokemon(
                        index
                    );

                }
            );


            postActions.appendChild(
                button
            );

        }
    );


    const cancelButton =
        document.createElement("button");


    cancelButton.textContent =
        "CANCELAR";


    cancelButton.addEventListener(
        "click",
        () => {

            openPostBattleMenu();

        }
    );


    postActions.appendChild(
        cancelButton
    );

}


/* =========================
   EXECUTAR SUBSTITUIÇÃO
========================= */

async function replacePokemon(
    index
) {

    postBattle.classList.add(
        "hidden"
    );


    showLoading(true);


    try {

        const newId =
            getRandomPokemonId();


        const newPokemon =
            await fetchPokemon(
                newId
            );


        state.team[index] =
            newPokemon;


        if (
            state.activePokemonIndex ===
            index
        ) {

            state.activePokemonIndex =
                findNextAlivePokemon();

        }


        state.replacementAvailable =
            false;


        renderTeamSlots();


        renderBattle();


        battleMessage.textContent =
            `${newPokemon.name} entrou para sua equipe.`;

        await wait(800);


        openPostBattleMenu();

    } catch (error) {

        console.error(error);

        alert(
            "Não foi possível substituir o Pokémon."
        );

    } finally {

        showLoading(false);

    }

}


/* =========================
   MENU PÓS-BATALHA
========================= */

function openPostBattleMenu() {

    postBattle.classList.remove(
        "hidden"
    );


    postTitle.textContent =
        "RODADA CONCLUÍDA";


    postMessage.textContent =
        `Rodada ${state.round} concluída.`;


    postActions.innerHTML = "";


    const nextButton =
        document.createElement("button");


    nextButton.textContent =
        "PRÓXIMA RODADA";


    nextButton.addEventListener(
        "click",
        async () => {

            postBattle.classList.add(
                "hidden"
            );


            await nextRound();

        }
    );


    postActions.appendChild(
        nextButton
    );

}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    state.battleLocked =
        true;


    postBattle.classList.remove(
        "hidden"
    );


    postTitle.textContent =
        "GAME OVER";


    postMessage.textContent =
        "Todos os seus Pokémon foram derrotados.";


    postActions.innerHTML = "";


    const restartButton =
        document.createElement("button");


    restartButton.textContent =
        "RECOMEÇAR";


    restartButton.addEventListener(
        "click",
        () => {

            restartGame();

        }
    );


    postActions.appendChild(
        restartButton
    );

}


/* =========================
   REINICIAR JOGO
========================= */

function restartGame() {

    state.team = [];

    state.activePokemonIndex = 0;

    state.enemy = null;

    state.round = 1;

    state.rollingCount = 0;

    state.battleLocked = false;

    state.replacementAvailable = false;


    postBattle.classList.add(
        "hidden"
    );


    pregameStart.classList.add(
        "hidden"
    );


    rollButton.disabled =
        false;


    rollMessage.textContent =
        "Role para escolher o primeiro Pokémon.";


    renderTeamSlots();


    showScreen(
        "pregame"
    );

}


/* =========================
   ESPERAR
========================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================
   INICIALIZAÇÃO
========================= */

renderTeamSlots();

showScreen("home");