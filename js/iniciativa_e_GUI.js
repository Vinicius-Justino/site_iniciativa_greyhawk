let mesa;
let ferramenta_atual, cards_selecionados;

function inicializa_mesa() {
    mesa = document.getElementById("mesa");

    cards_selecionados = [];
    ferramenta_atual = "definir-acoes";
    troca_ferramenta("adicionar-jogador");

}

function troca_ferramenta(ferramenta_nova) {
    troca_titulo_sessao(ferramenta_nova);

    if (ferramenta_nova.includes("adicionar")) {
        let tipo_personagem = ferramenta_nova.split("-")[1];
        ferramenta_nova = "adicionar-personagem";

        prepara_sessao_adicionar_personagem(tipo_personagem);
    }

    troca_conteudo(ferramenta_nova)
    ferramenta_atual = ferramenta_nova;
}

function prepara_sessao_adicionar_personagem(tipo) {
    let campo_vida = document.getElementById("cx_vida");
    let campo_quantidade = document.getElementById("cx_quantidade");
    let botao_adicionar = document.querySelector("#conteudo-adicionar-personagem > button");

    switch (tipo) {
        case "jogador":
            campo_vida.value = "";
            campo_vida.disabled = true;

            campo_quantidade.value = "";
            campo_quantidade.disabled = true;
            break;

        case "inimigo":
            campo_vida.disabled = false;
            campo_quantidade.disabled = false;
            break;
    }

    botao_adicionar.onclick = function() {
        adiciona_personagem(tipo);
    };
}

function troca_titulo_sessao(ferramenta) {
    let titulo_sessao = document.getElementById("nome-sessao");

    let pares_ferramenta_titulo = [
        ["adicionar-jogador", "Adicionar Jogador"],
        ["adicionar-inimigo", "Adicionar Inimigo"],
        ["definir-acoes", "Definir Ações"],
        ["apagar-personagens", "Apagar Personagens"]
    ];

    pares_ferramenta_titulo.forEach(function(value) {
        if (ferramenta == value[0]) {
            titulo_sessao.innerText = value[1];
        }
    });
}

function troca_conteudo(ferramenta) {
    document.getElementById(`conteudo-${ferramenta_atual}`).style.display = "none";
    document.getElementById(`conteudo-${ferramenta}`).style.display = "";
}

let cont_cards = 0;
let cards_na_mesa = [];
function adiciona_personagem(tipo) {
    let mensagem_erro = "Preencha os campos:";
    [["cx_nome", "Nome"], ["cx_dex", "Destreza bruta"]].forEach(function(value) {
        let campo = document.getElementById(value[0]);

        if (!campo.disabled && campo.value == "") {
            mensagem_erro += ` ${value[1]},`;
        }
    });

    if (mensagem_erro != "Preencha os campos:") {
        alert(mensagem_erro.substring(0, mensagem_erro.length - 1));
        return;
    }

    let quantidade_cards;
    if (!document.getElementById("cx_quantidade").disabled) {
        quantidade_cards = parseInt(document.getElementById("cx_quantidade").value);
    } else {
        quantidade_cards = 1;
    }

    let i = 0;
    do {
        cont_cards++;

        let card_personagem = document.createElement("div");
        card_personagem.classList.add("card", tipo);
        card_personagem.onclick = function() {
            card_clicado(card_personagem);
        };

        card_personagem.style.order = "0";
        card_personagem.style.transition = "order 1s";

        let img_card = document.createElement("img");
        let nome_img_card = (tipo == "jogador") ? "shield" : "exclamation-diamond";
        img_card.src = `./img/${nome_img_card}-fill.svg`;
        img_card.alt = `Ícone ${tipo}`;

        card_personagem.appendChild(img_card);

        let bloco_stats = document.createElement("div");
        ["nome", "vida", "iniciativa", "dex", "modificador", "acao"].forEach(function(value) {
            let stat = document.createElement("p");
            stat.className = value;

            switch (value) {
                case "nome":
                    let nome_card = `${document.getElementById("cx_nome").value}` + ((quantidade_cards > 1) ? `-${i + 1}` : "");
                    stat.innerText = `Nome: ${nome_card}`;

                    card_personagem.id = `${nome_card.split("-")[0]}-${cont_cards}`;
                    break;
                
                case "vida":
                    let campo_vida = document.getElementById("cx_vida");
                    let vida = (!(campo_vida.disabled || campo_vida.value == "")) ? `${campo_vida.value}/${campo_vida.value}` : "n/a";
                    stat.innerText = `HP: ${vida}`;

                    stat.ondblclick = function() {
                        atualiza_vida(stat);
                    };
                    break;
                
                case "iniciativa":
                    stat.innerText = "Iniciativa: n/a";
                    break;

                case "dex":
                    stat.innerText = `Dex: ${document.getElementById("cx_dex").value}`;
                    break;

                case "modificador":
                    stat.innerText = `Mod: ${document.querySelector('input[name="modificador-iniciativa"]:checked').value}`;

                    stat.ondblclick = function() {
                        atualiza_modificador(stat);
                    };
                    break;

                case "acao":
                    stat.innerText = "Próx. ação:";
                    break;
            }

            bloco_stats.appendChild(stat);
        });

        card_personagem.appendChild(bloco_stats);
        cards_na_mesa.push(card_personagem.id);
        mesa.appendChild(card_personagem);
        i++;
    } while(i < quantidade_cards);
}

function card_clicado(card) {
    switch (ferramenta_atual) {
        case "definir-acoes":
            if (!cards_selecionados.includes(card.id)) {
                cards_selecionados.push(card.id);
            }
            break;

        case "apagar-personagens":
            let quantidade_cards = cards_na_mesa.length;
            for (let i = 0; i < quantidade_cards; i++) {
                let id_card_atual = cards_na_mesa.shift();

                if (id_card_atual != card.id) {
                    cards_na_mesa.push(id_card_atual);
                }
            }

            mesa.removeChild(card);
            break;
    }

    atualiza_cards_selecionados();
}

function limpar_selecao() {
    cards_selecionados = [];

    atualiza_cards_selecionados();
}

function atualiza_cards_selecionados() {
    let lista_personagens_selecionados = document.getElementById("personagens-selecionados");
    lista_personagens_selecionados.innerText = "Personagens selecionados: ";

    if (cards_selecionados == []) {
        lista_personagens_selecionados.innerText += "nenhum";
        return;
    }

    cards_selecionados.forEach(function(value) {
        let nome_card = document.querySelector(`#${value} .nome`).innerText.substring(6);
        lista_personagens_selecionados.innerText += ` ${nome_card}`;
    });
}

function atualiza_vida(p_vida) {
    let mensagem_vida = p_vida.innerText.split(" ");
    let vida_atual_e_max = mensagem_vida[1].split("/");

    vida_atual_e_max[0] = prompt("Novo valor de HP:");

    p_vida.innerText = `${mensagem_vida[0]} ${vida_atual_e_max[0]}/${vida_atual_e_max[1]}`;
}

function atualiza_modificador(p_modificador) {
    let novo_mod;

    do {
        novo_mod = prompt("Novo modificador de iniciativa: (vantagem, nenhum ou desvantagem)");
    } while(!["vantagem", "nenhum", "desvantagem"].includes(novo_mod.toLowerCase()));

    p_modificador.innerText = `${p_modificador.innerText.split(" ")[0]} ${novo_mod.toLowerCase()}`;
}

function definir_acao() {
    let acao = document.getElementById("acao").value;
    let codigos_validos = ["r", "m", "a", "c", "!"];

    cards_selecionados.forEach(function(value) {
        let p_prox_acao = document.querySelector(`#${value} .acao`);
        let partes_mensagem = p_prox_acao.innerText.split(":");
        p_prox_acao.innerText = `${partes_mensagem[0]}: `;
    });

    acao.split("").forEach(function(value) {
        if (!codigos_validos.includes(value.toLowerCase())) {
            return;
        }

        let codigo = value.toLowerCase();
        cards_selecionados.forEach(function(value) {
            document.querySelector(`#${value} .acao`).innerText += codigo;
        });
    });
}


let cards_ativos, cards_inativos;
function rolar_iniciativa() {
    cards_ativos = [];
    cards_inativos = [];

    animar_dado();

    cards_na_mesa.forEach(function(value) {
        calcula_iniciativa_individual(value);
    });
    
    organiza_iniciativas();

    organiza_cards();
}

function animar_dado() {
    let dado = document.getElementById("img-dado");
    let novo_numero = (Math.floor(Math.random() * 1000) % 6) + 1;

    dado.style.rotate = (dado.style.rotate == "0deg") ? "720deg" : "0deg";

    dado.src = `./img/dice-${novo_numero}.svg`;
    dado.alt = `Dado de ${novo_numero} lados`;
}

const valores_adicionais = {
    "r": "d4",
    "m": "d6",
    "a": "d8",
    "c": "d10",
    "!": "10"
};
function calcula_iniciativa_individual(id_card) {
    let card = {
        iniciativa: "n/a",
        dex: 0,
        id: id_card
    };

    card.dex = parseInt(document.querySelector(`#${card.id} .dex`).innerText.split(" ")[1]);

    let acao_card = document.querySelector(`#${card.id} .acao`);
    let partes_acao = acao_card.innerText.split(":");
    if (partes_acao[1] == "") {
        document.querySelector(`#${card.id} .iniciativa`).innerText = `Iniciativa: ${card.iniciativa}`;
        cards_inativos.push(card);
        return;
    }

    card.iniciativa = 0;
    partes_acao[1].split("").forEach(function(value) {
        let valor_adicional = valores_adicionais[value];

        if (valor_adicional.includes("d")) {
            card.iniciativa += (Math.floor(Math.random() * 1000) % parseInt(valor_adicional.substring(1))) + 1;
        } else {
            card.iniciativa += parseInt(valor_adicional);
        }
    });

    acao_card.innerText = `${partes_acao[0]}: `; 

    let modificador_iniciativa = document.querySelector(`#${card.id} .modificador`).innerText.split(" ")[1];
    switch (modificador_iniciativa) {
        case "vantagem":
            card.iniciativa -= 2;
            break;

        case "desvantagem":
            card.iniciativa += 2;
    }

    document.querySelector(`#${card.id} .iniciativa`).innerText = `Iniciativa: ${card.iniciativa}`;
    cards_ativos.push(card);
}

let iniciativa_organizada;
function organiza_iniciativas() {
    iniciativa_organizada = [];
    let quantidade_iniciativas = cards_ativos.length;
    if (quantidade_iniciativas == 0) {
        return;
    }

    iniciativa_organizada.push(cards_ativos.pop());
    
    for (let iniciativas_organizadas = 1; iniciativas_organizadas < quantidade_iniciativas; iniciativas_organizadas++) {
        let lista_cards_comparados = [];
        let card_atual = cards_ativos.pop();

        do {
            let card_comparado = iniciativa_organizada.shift();

            if (card_atual.iniciativa < card_comparado.iniciativa) {
                iniciativa_organizada = lista_cards_comparados.concat([card_atual, card_comparado], iniciativa_organizada);
            } else if (card_atual.iniciativa == card_comparado.iniciativa) {
                if (card_atual.dex >= card_comparado.dex) {
                    iniciativa_organizada = lista_cards_comparados.concat([card_atual, card_comparado], iniciativa_organizada);
                } else {
                    lista_cards_comparados.push(card_comparado);
                }
            } else if (iniciativa_organizada.length == 0) {
                iniciativa_organizada = lista_cards_comparados.concat([card_comparado, card_atual]);
            } else {
                lista_cards_comparados.push(card_comparado);
            }

        } while (!iniciativa_organizada.includes(card_atual));
    }
}

function organiza_cards() {
    let posicao = 1;

    [iniciativa_organizada, cards_inativos].forEach(function(value) {
        let lista = value;

        lista.forEach(function(value) {
            document.getElementById(value.id).style.order = posicao.toString();
            posicao++;
        });
    });
}