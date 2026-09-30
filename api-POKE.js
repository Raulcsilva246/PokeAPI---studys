let vantagens = {
    normal: [],

    fire: ["grass", "ice", "bug", "steel"],

    water: ["fire", "ground", "rock"],

    electric: ["water", "flying"],

    grass: ["water", "ground", "rock"],

    ice: ["grass", "ground", "flying", "dragon"],

    fighting: ["normal", "ice", "rock", "dark", "steel"],

    poison: ["grass", "fairy"],

    ground: ["fire", "electric", "poison", "rock", "steel"],

    flying: ["grass", "fighting", "bug"],

    psychic: ["fighting", "poison"],

    bug: ["grass", "psychic", "dark"],

    rock: ["fire", "ice", "flying", "bug"],

    ghost: ["psychic", "ghost"],

    dragon: ["dragon"],

    dark: ["psychic", "ghost"],

    steel: ["ice", "rock", "fairy"],

    fairy: ["fighting", "dragon", "dark"]
};

let tipoA = ""
let ataqueA = 0
let defesaA = 0
let pontuacao_finalA = 0

let tipoB = ""
let ataqueB = 0
let defesaB = 0
let pontuacao_finalB = 0

let dadospkx = {} //variavel para receber o retorno da api

let resp0 = document.getElementById("resp0"); // pega o id do elemento de resposta "0" e coloca em uma variavel
let resp1 = document.getElementById("resp1"); // pega o id do elemento de resposta "1" e coloca em uma variavel
let resp2 = document.getElementById("resp2"); // pega o id do elemento de resposta "2" e coloca em uma variavel
let resp3 = document.getElementById("resp3"); // pega o id do elemento de resposta "3" e coloca em uma variavel

let img = document.getElementById("img")

let input = document.getElementById("input"); // pega o id do input e coloca em uma variavel

/////////////////////////////////////////////////////////////////////////

let dadosA = {} //variavel para receber o retorno da api

let resp0A = document.getElementById("resp0A"); // pega o id do elemento de resposta "0" e coloca em uma variavel
let resp1A = document.getElementById("resp1A"); // pega o id do elemento de resposta "1" e coloca em uma variavel
let resp2A = document.getElementById("resp2A"); // pega o id do elemento de resposta "2" e coloca em uma variavel
let resp3A = document.getElementById("resp3A"); // pega o id do elemento de resposta "3" e coloca em uma variavel
let resp4A = document.getElementById("resp4A"); // pega o id do elemento de resposta "3" e coloca em uma variavel
let imgA = document.getElementById("imgA")

let dadosB = {} //variavel para receber o retorno da api

let resp0B = document.getElementById("resp0B"); // pega o id do elemento de resposta "0" e coloca em uma variavel
let resp1B = document.getElementById("resp1B"); // pega o id do elemento de resposta "1" e coloca em uma variavel
let resp2B = document.getElementById("resp2B"); // pega o id do elemento de resposta "2" e coloca em uma variavel
let resp3B = document.getElementById("resp3B"); // pega o id do elemento de resposta "3" e coloca em uma variavel
let resp4B = document.getElementById("resp4B"); // pega o id do elemento de resposta "3" e coloca em uma variavel
let imgB = document.getElementById("imgB")

let result = document.getElementById("result")

async function pokedex() { //cabeçalho de uma função assyncrona

    const valor = input.value //transfere o valor do input para uma variavel de mesmo nome
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`) //espera o retorno da api e usando o valor do input localiza na api e coloca em uma var

    

    dadospkx = await resposta.json() //pega a resposta da api, usando Json coloca na variavel "dados"
    console.log(dadospkx)

    img.src = dadospkx.sprites.front_default;

    resp0.innerHTML = "Nome: "+dadospkx.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp1.innerHTML = "Id: "+dadospkx.id //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp2.innerHTML = "Tipo: "+dadospkx.types[0].type.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp3.innerHTML = "peso: "+dadospkx.weight //pega o subvalor do json que recebeu os dados e modifica o HTML
    
}

async function red_dex(){
    const valor = Math.floor(Math.random() * 386) + 1

    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`)

    dadosA = await resposta.json()

    imgA.src = dadosA.sprites.front_default;

    resp0A.innerHTML = "Nome: "+dadosA.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp1A.innerHTML = "Id: "+dadosA.id //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp2A.innerHTML = "Tipo: "+dadosA.types[0].type.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp3A.innerHTML = "peso: "+dadosA.weight //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp4A.innerHTML = dadosA.stats[1].stat.name+": "+dadosA.stats[1].base_stat //pega o subvalor do json que recebeu os dados e modifica o HTML

    tipoA = dadosA.types[0].type.name
    ataqueA = dadosA.stats[1].base_stat
    defesaA = dadosA.stats[2].base_stat
}

async function blue_dex(){
    const valor = Math.floor(Math.random() * 386) + 1

    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`)

    dadosB = await resposta.json()

    imgB.src = dadosB.sprites.front_default;

    resp0B.innerHTML = "Nome: "+dadosB.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp1B.innerHTML = "Id: "+dadosB.id //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp2B.innerHTML = "Tipo: "+dadosB.types[0].type.name //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp3B.innerHTML = "peso: "+dadosB.weight //pega o subvalor do json que recebeu os dados e modifica o HTML
    resp4B.innerHTML = dadosB.stats[1].stat.name+": "+dadosB.stats[1].base_stat //pega o subvalor do json que recebeu os dados e modifica o HTML

    tipoB = dadosB.types[0].type.name
    ataqueB = dadosB.stats[1].base_stat
    defesaB = dadosB.stats[2].base_stat
    
}

async function start(){
result.innerHTML = "Vencedor:"
    await red_dex()
    await blue_dex()

    if(vantagens[tipoA].includes(tipoB)){
        ataqueA = ataqueA * 2
}else if(vantagens[tipoB].includes(tipoA)){
        ataqueB = ataqueB * 2
}

    pontuacao_finalA = ataqueA - defesaB
    pontuacao_finalB = ataqueB - defesaB


if(pontuacao_finalA > pontuacao_finalB){
    result.innerHTML = "Vencedor:<br>" + dadosA.name
}else if(pontuacao_finalA < pontuacao_finalB){
    result.innerHTML = "Vencedor:<br> " + dadosB.name
}else{
    result.innerHTML = "Empate"
}
    reset()
}

function reset() {
    tipoA = ""
    ataqueA = 0
    defesaA = 0
    pontuacao_finalA = 0

    tipoB = ""
    ataqueB = 0
    defesaB = 0
    pontuacao_finalB = 0

    dadosA = {}
    dadosB = {}
}