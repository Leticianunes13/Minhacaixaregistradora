// Estoque inicial (pode ser modificado com a nova função)
const estoque = [
    { codigo: 1, nome: "Arroz 1kg", preco: 12.50 },
    { codigo: 2, nome: "Feijão 1kg", preco: 9.80 },
    { codigo: 3, nome: "Macarrão 500g", preco: 4.20 },
    { codigo: 4, nome: "Óleo de soja 500ml", preco: 8.50 },
    { codigo: 5, nome: "Açúcar 1kg", preco: 5.30 },
    { codigo: 6, nome: "Sal 1kg", preco: 2.50 },
    { codigo: 7, nome: "Leite 1L", preco: 4.00 },
    { codigo: 8, nome: "Café 250g", preco: 12.80 },
    { codigo: 9, nome: "Manteiga 500g", preco: 22.00 },
    { codigo: 10, nome: "Margarina 500g", preco: 5.50 }
];

let carrinho = [];

// --- NOVA FUNÇÃO PARA ADICIONAR PRODUTOS AO ESTOQUE ---
function adicionarAoEstoque() {
    const nomeInput = document.getElementById("novoProdutoNome");
    const precoInput = document.getElementById("novoProdutoPreco");

    const nome = nomeInput.value.trim();
    const preco = Number(precoInput.value);

    if (!nome || !preco || preco <= 0) {
        alert("Por favor, preencha o nome e um preço válido para o novo produto.");
        return;
    }

    // Cria um novo código baseado no maior código existente
    const maiorCodigo = estoque.reduce((max, p) => p.codigo > max ? p.codigo : max, 0);
    const novoCodigo = maiorCodigo + 1;

    estoque.push({
        codigo: novoCodigo,
        nome: nome,
        preco: preco
    });

    alert(`Produto "${nome}" adicionado ao estoque com o código ${novoCodigo}!`);
    nomeInput.value = "";
    precoInput.value = "";
}


// --- FUNÇÃO MODIFICADA PARA BUSCAR POR CÓDIGO OU NOME ---
function adicionarAoCarrinho() {
    const produtoInput = document.getElementById("produtoInput");
    const quantidadeInput = document.getElementById("quantidadeInput");
    
    const valorBusca = produtoInput.value.trim();
    const quantidade = Number(quantidadeInput.value);
    
    if (!valorBusca || quantidade < 1) {
        alert("Informe um produto e uma quantidade válida.");
        return;
    }

    let produtoEncontrado;
    const buscaNumerica = Number(valorBusca);

    // Se o valor digitado for um número, busca por código. Senão, busca por nome.
    if (!isNaN(buscaNumerica) && buscaNumerica > 0) {
        produtoEncontrado = estoque.find(p => p.codigo === buscaNumerica);
    } else {
        produtoEncontrado = estoque.find(p => p.nome.toLowerCase() === valorBusca.toLowerCase());
    }

    if (!produtoEncontrado) {
        alert("Produto não encontrado no estoque!");
        return;
    }
    
    const itemExistente = carrinho.find(item => item.codigo === produtoEncontrado.codigo);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco;
    } else {
        carrinho.push({
            codigo: produtoEncontrado.codigo,
            nome: produtoEncontrado.nome,
            preco: produtoEncontrado.preco,
            quantidade: quantidade,
            subtotal: quantidade * produtoEncontrado.preco
        });
    }

    atualizarTabela();
    produtoInput.value = "";
    quantidadeInput.value = "1";
    produtoInput.focus();
    document.getElementById("sugestoes").innerHTML = ""; // Limpa sugestões
}


function atualizarTabela() {
    const tbody = document.querySelector("#tabelaCarrinho tbody");
    tbody.innerHTML = "";

    let total = 0;
    carrinho.forEach(item => {
        total += item.subtotal;
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${item.codigo}</td>
                        <td>${item.nome}</td>
                        <td>${item.quantidade}</td>
                        <td>R$ ${item.preco.toFixed(2)}</td>
                        <td>R$ ${item.subtotal.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });

    document.getElementById("totalCompra").textContent = `Total: R$ ${total.toFixed(2)}`;
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("O carrinho está vazio!");
        return;
    }

    const valorPagoInput = document.getElementById("valorPagoInput");
    const valorPago = Number(valorPagoInput.value);
    const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

    if (isNaN(valorPago) || valorPago <= 0) {
        alert("Por favor, insira um valor de pagamento válido!");
        valorPagoInput.focus();
        return;
    }

    if (valorPago < total) {
        alert("O valor pago é insuficiente!");
        valorPagoInput.focus();
        return;
    }

    const troco = valorPago - total;
    const data = new Date();
    
    document.getElementById("trocoCalculado").textContent = `Troco: R$ ${troco.toFixed(2)}`;

    let textoRecibo = `        Mercearia Preço Bom\n`;
    textoRecibo += `--------------------------------------\n`;
    textoRecibo += ` Recibo nº ${Math.floor(Math.random() * 100000)}\n`;
    textoRecibo += ` Data: ${data.toLocaleString('pt-BR')}\n`;
    textoRecibo += ` Operador: Caixa 01\n`;
    textoRecibo += `--------------------------------------\n`;
    textoRecibo += `Itens Comprados:\n\n`;

    carrinho.forEach(item => {
        textoRecibo += `${item.nome} \n`;
        textoRecibo += `  ${item.quantidade} un x R$ ${item.preco.toFixed(2)} = R$ ${item.subtotal.toFixed(2)}\n\n`;
    });

    textoRecibo += `--------------------------------------\n`;
    textoRecibo += `TOTAL: R$ ${total.toFixed(2)}\n`;
    textoRecibo += `VALOR PAGO: R$ ${valorPago.toFixed(2)}\n`;
    textoRecibo += `TROCO: R$ ${troco.toFixed(2)}\n`;
    textoRecibo += `--------------------------------------\n`;
    textoRecibo += `      Obrigado e volte sempre!`;

    document.getElementById("recibo").textContent = textoRecibo;

    carrinho = [];
    atualizarTabela();
    valorPagoInput.value = "";
    
    setTimeout(() => {
        document.getElementById("trocoCalculado").textContent = "";
    }, 5000);
}


// --- LÓGICA PARA O AUTOCOMPLETAR ---
const produtoInput = document.getElementById("produtoInput");
const sugestoesContainer = document.getElementById("sugestoes");

produtoInput.addEventListener("keyup", (e) => {
    const texto = e.target.value.toLowerCase();
    sugestoesContainer.innerHTML = "";

    if (texto.length < 2) { // Só busca a partir de 2 caracteres
        return;
    }
    
    const sugestoes = estoque.filter(produto => 
        produto.nome.toLowerCase().includes(texto)
    );

    sugestoes.forEach(sugestao => {
        const div = document.createElement("div");
        div.innerHTML = sugestao.nome;
        div.classList.add("sugestao-item");
        div.onclick = () => {
            produtoInput.value = sugestao.nome;
            sugestoesContainer.innerHTML = "";
            document.getElementById("quantidadeInput").focus(); // Foca na quantidade
        };
        sugestoesContainer.appendChild(div);
    });
});

// Fecha a lista de sugestões se clicar fora dela
document.addEventListener("click", function (e) {
    if (e.target.id !== "produtoInput") {
        sugestoesContainer.innerHTML = "";
    }
});