/* 
  --------------------------------------------------------------------------------------
  Modal com form de cadastro de evento. 
  --------------------------------------------------------------------------------------
*/
const modalCadastroEvento = new bootstrap.Modal('#modalCadastroEvento');

/*
  --------------------------------------------------------------------------------------
  Função para recuperar os eventos da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarEventos = async (id) => {
    let url = dominio + '/pessoa?' + new URLSearchParams({
        id: id
    });
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            this.pessoa = data;
            document.getElementById("nomePessoaEvento").innerHTML = this.pessoa.nome;
            data.eventos.forEach(evento => preencherListagemEventos(evento))
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar a tabela de eventos.
  --------------------------------------------------------------------------------------
*/
const limparTable = () => {
    var tableHeaderRowCount = 1;
    var table = document.getElementById('tblEventos');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir um evento na tabela de eventos.
  --------------------------------------------------------------------------------------
*/
const preencherListagemEventos = (evento) => {
    var table = document.getElementById('tblEventos');
    var row = table.insertRow();
    var cel = row.insertCell(0);
    cel.textContent = evento.nome;

    inserirBotaoExclucao(row.insertCell(-1), evento.id);

    document.getElementById("nomeEvento").value = "";
    removerEvento();
}

/*
  --------------------------------------------------------------------------------------
  Função para remover um evento da tabela de eventos.
  --------------------------------------------------------------------------------------
*/
const removerEvento = () => {
    let close = document.getElementsByClassName("close");
    let i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let id = this.id;
            let div = this.parentElement.parentElement;
            if (confirm("Confirma a exclusão do evento?")) {
                div.remove();
                excluirEvento(id);
            }
        }
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para excluir um evento da base de dados.
  --------------------------------------------------------------------------------------
*/
const excluirEvento = (id) => {
    let url = dominio + '/evento?id=' + id;
    fetch(url, {
        method: 'delete'
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para criar o botão de exclusão de evento.
  --------------------------------------------------------------------------------------
*/
const inserirBotaoExclucao = (parent, id) => {
    let span = document.createElement("span");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.id = id;
    span.appendChild(txt);
    parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Função para validar o cadastro de evento.
  --------------------------------------------------------------------------------------
*/
const validarCadastroEvento = () => {
    let nomeEvento = document.getElementById("nomeEvento").value;
    if (nomeEvento === '') {
        alert("Informe o nome do evento!");
    } else {
        salvarEvento(nomeEvento);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para salvar um evento no banco de dados.
  --------------------------------------------------------------------------------------
*/
const salvarEvento = async (nomeEvento) => {
    const formData = new FormData();
    formData.append('id_pessoa', this.pessoa.id);
    formData.append('nome', nomeEvento);
    let url = dominio + '/evento';
    fetch(url, {
        method: 'post',
        body: formData
    })
        .then((response) => {
            if (response.status == 200) {
                let evento = { nome: nomeEvento };
                preencherListagemEventos(evento);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para abrir o modal com formulário de cadastro de evento.
  --------------------------------------------------------------------------------------
*/
const abrirModalCadastroEvento = (id) => {
    limparTable();
    recuperarEventos(id);
    modalCadastroEvento.show();
}

/*
--------------------------------------------------------------------------------------
Função para fechar o modal com formulário de cadastro de evento.
--------------------------------------------------------------------------------------
*/
const fecharModalCadastroEvento = () => {
    modalCadastroEvento.hide();
}