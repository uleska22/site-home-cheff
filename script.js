const areaMensagens = document.getElementById("mensagens");
const formulario = document.getElementById("formulario-chat");
const entradaInput = document.getElementById("entrada-chat");

let modoSelecionado = null;

// Base de dados de receitas simulando a resposta da IA do sistema
const baseReceitas = [
    {
        nome: "Macarrão alho e óleo",
        tempo: 14,
        ingredientes: ["macarrão", "alho", "azeite", "manteiga", "ervas", "sal"],
        listaDetalhada: [
            "1 pacote de macarrão 500 g",
            "1/2 tablete de manteiga (não use margarina)",
            "1 colher (sopa) de azeite extra virgem",
            "ervas (manjericão, orégano, salsa, cebolinha, tomilho, a gosto)",
            "Sal a gosto",
            "1 dente de alho"
        ],
        modoPreparo: [
            "Cozinhe o macarrão em água fervente com sal.",
            "Doure o alho picado no azeite e na manteiga em fogo baixo.",
            "Misture a massa cozida ao refogado e finalize com as ervas frescas."
        ]
    },
    {
        nome: "Macarrão à bolonhesa",
        tempo: 30,
        ingredientes: ["macarrão", "carne", "tomate", "cebola", "alho"],
        listaDetalhada: [
            "250 g de macarrão",
            "250 g de carne moída",
            "3 tomates picados",
            "1/2 cebola picada",
            "1 dente de alho esmagado",
            "Sal e azeite a gosto"
        ],
        modoPreparo: [
            "Cozinhe o macarrão até ficar al dente.",
            "Refogue a cebola, o alho e adicione a carne moída até dourar.",
            "Acrescente o tomate picado, deixe formar molho e misture à massa."
        ]
    },
    {
        nome: "Macarrão de Abobrinha com Molho de Tomate",
        tempo: 15,
        ingredientes: ["abobrinha", "tomate", "alho", "azeite", "sal"],
        listaDetalhada: [
            "2 abobrinhas médias cortadas em fitas",
            "3 tomates maduros picados",
            "1 dente de alho",
            "Azeite e sal a gosto"
        ],
        modoPreparo: [
            "Refogue o alho no azeite, adicione os tomates e cozinhe até amolecerem.",
            "Acrescente as fitas de abobrinha por 3 a 5 minutos para manter a crocância.",
            "Tempere com sal e sirva quente."
        ]
    }
];

// Função para injetar novas mensagens na tela do chat
function adicionarMensagem(texto, tipo = "bot") {
    const div = document.createElement("div");
    div.className = `mensagem ${tipo}`;
    div.innerText = texto;
    areaMensagens.appendChild(div);
    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

// Função para renderizar botões interativos de opções dentro da conversa
function adicionarBotoesOpcoes(opcoesArray) {
    const divOpcoes = document.createElement("div");
    divOpcoes.className = "opcoes";

    opcoesArray.forEach(opcao => {
        const btn = document.createElement("button");
        btn.innerText = opcao.texto;
        btn.addEventListener("click", () => {
            divOpcoes.remove(); // Remove os botões antigos após a escolha
            opcao.acao();
        });
        divOpcoes.appendChild(btn);
    });

    areaMensagens.appendChild(divOpcoes);
    areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

// 1. O usuário clica em uma das opções iniciais (Nome, Ingredientes ou Tempo)
function escolherModo(modo) {
    modoSelecionado = modo;

    if (modo === "nome") {
        adicionarMensagem("Digite o nome da receita que você procura:", "bot");
        entradaInput.placeholder = "Ex: Macarrão alho e óleo...";
    } else if (modo === "ingredientes") {
        adicionarMensagem("Quais ingredientes você tem em casa? Separe-os por vírgula:", "bot");
        entradaInput.placeholder = "Ex: macarrão, alho, azeite, cenoura...";
    } else if (modo === "tempo") {
        adicionarMensagem("Quanto tempo você tem disponível para cozinhar?", "bot");
        adicionarBotoesOpcoes([
            { texto: "Até 15 minutos ⏱", acao: () => filtrarPorTempo(15) },
            { texto: "Até 30 minutos ⏱", acao: () => filtrarPorTempo(30) },
            { texto: "Até 45 minutos ⏱", acao: () => filtrarPorTempo(45) }
        ]);
        return;
    }
    entradaInput.focus();
}

// 2. Lógica para filtrar por tempo de preparo
function filtrarPorTempo(limiteMinutos) {
    adicionarMensagem(`Até ${limiteMinutos} minutos`, "usuario");
    const encontradas = baseReceitas.filter(r => r.tempo <= limiteMinutos);
    apresentarResultados(encontradas);
}

// 3. Captura o texto digitado no input do chat (Busca por Nome ou Ingredientes)
formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const textoDigitado = entradaInput.value.trim();
    if (!textoDigitado) return;

    adicionarMensagem(textoDigitado, "usuario");
    entradaInput.value = "";

    if (modoSelecionado === "nome") {
        const termo = textoDigitado.toLowerCase();
        const encontradas = baseReceitas.filter(r => r.nome.toLowerCase().includes(termo));
        apresentarResultados(encontradas);
    } 
    else if (modoSelecionado === "ingredientes") {
        const itensUsuario = textoDigitado.toLowerCase().split(",").map(i => i.trim());
        
        // IA Simulada: calcula pontuação de relevância com base nos ingredientes informados
        const pontuadas = baseReceitas.map(receita => {
            let acertos = receita.ingredientes.filter(ing => 
                itensUsuario.some(userIng => userIng.includes(ing))
            ).length;
            return { receita, acertos };
        });

        const filtradas = pontuadas.filter(p => p.acertos > 0).sort((a,b) => b.acertos - a.acertos);
        const encontradas = filtradas.map(f => f.receita);

        apresentarResultados(encontradas);
    } 
    else {
        adicionarMensagem("Por favor, clique em uma das opções iniciais (Nome, Ingredientes ou Tempo) para guiar a busca da IA.", "bot");
        reiniciarChat();
    }
});

// 4. Exibe a lista de receitas encontradas (Igual à tela 3 do TCC)
function apresentarResultados(lista) {
    if (lista.length === 0) {
        adicionarMensagem("Não encontrei nenhuma receita correspondente na base. Tente outros ingredientes!", "bot");
        reiniciarChat();
        return;
    }

    adicionarMensagem("Aqui estão as receitas encontradas:", "bot");
    
    const botoesReceitas = lista.map(rec => ({
        texto: rec.nome,
        acao: () => exibirDetalhesReceita(rec)
    }));

    botoesReceitas.push({ texto: "Fazer nova busca 🔄", acao: reiniciarChat });
    adicionarBotoesOpcoes(botoesReceitas);
}

// 5. Exibe os ingredientes detalhados e o modo de preparo (Igual à tela 4 do TCC)
function exibirDetalhesReceita(receita) {
    let textoIngredientes = receita.listaDetalhada.map(item => `• ${item}`).join("\n");
    let textoPreparo = receita.modoPreparo.map((passo, index) => `${index + 1}. ${passo}`).join("\n");

    let mensagemCompleta = `${receita.nome}\n\n` +
                           `Tempo de preparo: ${receita.tempo} min\n\n` +
                           `Ingredientes:\n${textoIngredientes}\n\n` +
                           `Modo de preparo:\n${textoPreparo}`;

    adicionarMensagem(mensagemCompleta, "bot");

    setTimeout(() => {
        adicionarBotoesOpcoes([
            { texto: "Buscar outra receita 🔍", acao: reiniciarChat }
        ]);
    }, 300);
}

// 6. Retorna ao menu inicial do chatbot
function reiniciarChat() {
    modoSelecionado = null;
    entradaInput.placeholder = "Digite sua escolha...";
    adicionarMensagem("Como você quer buscar sua receita hoje? 👩‍🍳", "bot");
    adicionarBotoesOpcoes([
        { texto: "Por Nome 🔎", acao: () => escolherModo('nome') },
        { texto: "Por Ingredientes 🥕 🥔 🧀", acao: () => escolherModo('ingredientes') },
        { texto: "Por Tempo ⏱", acao: () => escolherModo('tempo') }
    ]);
}