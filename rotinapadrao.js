/* 
  --------------------------------------------------------------------------------------
  Modal com formuláro de cadastro de rotina padrão. 
  --------------------------------------------------------------------------------------
*/
const modalCadastroRotinaPadrao = new bootstrap.Modal('#modalCadastroRotinaPadrao');

let diaSemana = "seg";
let rotinasPadrao = [];

/*
  --------------------------------------------------------------------------------------
  Função para recuperar os dados da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarPessoaEventos = async (id) => {
    let url = dominio + '/pessoa?' + new URLSearchParams({
        id: id
    });
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            this.pessoa = data;
            document.getElementById("nomePessoaRotinaPadrao").innerHTML = this.pessoa.nome;
            data.eventos.forEach(evento => preencherComboEventos(evento))
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para preencher o combo de eventos.
  --------------------------------------------------------------------------------------
*/
const preencherComboEventos = (evento) => {
    let sctEventos = document.getElementById("sctEventos");
    let option = document.createElement("option");
    option.value = evento.id;
    option.text = evento.nome;
    sctEventos.add(option);
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar o combo de eventos.
  --------------------------------------------------------------------------------------
*/
const limparSelectEventos = () => {
    let sctEventos = document.getElementById('sctEventos');
    let i, l = sctEventos.options.length - 1;
    for (i = l; i >= 1; i--) {
        sctEventos.remove(i);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para abrir o modal com formulário de cadastro de rotina padrão.
  --------------------------------------------------------------------------------------
*/
const abrirModalCadastroRotinaPadrao = (id) => {
    recuperarRotinasPadraoPorDiaSemana();
    limparInputsRotinaPadrao();
    recuperarPessoaEventos(id);
    recuperarRotinasPadraoPessoa(id);
    modalCadastroRotinaPadrao.show();
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar o formulário de cadastro de rotina padrão.
  --------------------------------------------------------------------------------------
*/
limparInputsRotinaPadrao = () => {
    document.getElementById("hora").value = "";
    limparSelectEventos();
    document.getElementById('sctDiasSemana').value = 8;
}

/*
  --------------------------------------------------------------------------------------
  Função para fechar o modal com formulário de cadastro de rotina padrão.
  --------------------------------------------------------------------------------------
*/
const fecharModalCadastroRotinaPadrao = () => {
    modalCadastroRotinaPadrao.hide();
}

/*
  --------------------------------------------------------------------------------------
  Função para validar o cadastro de rotina padrão
  --------------------------------------------------------------------------------------
*/
const validarRotinaPadrao = () => {
    let hora = document.getElementById("hora").value;
    let sctEventos = document.getElementById("sctEventos").value;
    if (!hora) {
        alert("Informe a hora do evento!");
    } else if (!sctEventos || sctEventos == 0) {
        alert("Selecione o evento!");
    } else {
        let diasSemana = [
            { id: 1, dia: 'seg', util: true },
            { id: 2, dia: 'ter', util: true },
            { id: 3, dia: 'qua', util: true },
            { id: 4, dia: 'qui', util: true },
            { id: 5, dia: 'sex', util: true },
            { id: 6, dia: 'sab', util: false },
            { id: 7, dia: 'dom', util: false },
        ]

        let diaSemana = document.getElementById("sctDiasSemana").value;
        if (diaSemana == 8) {
            //Se selecionou "Todos os dias...".
            salvarRotinaPadrao(diasSemana);
        } else if (diaSemana == 9) {
            //Se selecionou "Seg a Sex".
            let diasUteis = diasSemana.filter(k => k.util);
            salvarRotinaPadrao(diasUteis);
        } else if (diaSemana == 10) {
            //Se selecionou "Sab e Dom".
            let fds = diasSemana.filter(k => !k.util);
            salvarRotinaPadrao(fds);
        } else {
            //Se selecionou o dia da semana.
            let diaFilter = diasSemana.filter(j => j.id == diaSemana);
            salvarRotinaPadrao(diaFilter);
        }
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para salvar um rotina padrão no banco de dados.
  --------------------------------------------------------------------------------------
*/
const salvarRotinaPadrao = async (diasSemana) => {
    const formData = new FormData();
    formData.append('id_pessoa', this.pessoa.id);
    formData.append('hora', document.getElementById("hora").value);
    formData.append('id_evento', document.getElementById("sctEventos").value);
    formData.append('diassemana', diasSemana.map(u => u.dia).join(','));
    formData.append('data_atual', (dataAtual.toLocaleDateString()).split("/").reverse().join("-")+'T00:00:00');
    let url = dominio + '/rotinapadrao';
    fetch(url, {
        method: 'post',
        body: formData
    })
        .then((response) => {
            if (response.status == 200) {
                document.getElementById("hora").value = "";
                document.getElementById('sctDiasSemana').value = 8;
                document.getElementById('sctEventos').value = 0;

                recuperarRotinasPadraoPessoa(this.pessoa.id);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar o dia da semana selecionado na tab.
  --------------------------------------------------------------------------------------
*/
let tabEl = document.querySelectorAll('button[data-bs-toggle="tab"]');
for (i = 0; i < tabEl.length; i++) {
    tabEl[i].addEventListener('shown.bs.tab', function (event) {
        const activated_pane = document.querySelector(event.target.getAttribute('data-bs-target'))
        diaSemana = activated_pane.id;
        recuperarRotinasPadraoPorDiaSemana();
    })
}

/*
  --------------------------------------------------------------------------------------
  Função para filtrar as rotinas padrão por dia da semana.
  --------------------------------------------------------------------------------------
*/
const recuperarRotinasPadraoPorDiaSemana = () => {
    limparTableRotinasPadrao();

    rotinasPadrao.forEach(rotinaPadrao => tratarTime(rotinaPadrao));

    let rotinasPadraoDiaSemana = rotinasPadrao.filter(k => k.diasemana == diaSemana);

    if (rotinasPadraoDiaSemana) {
        //Realiza a ordenação pela hora.
        rotinasPadraoDiaSemana.sort(compare);
        rotinasPadraoDiaSemana.forEach(rotinaPadrao => preencherListagemRotinasPadrao(rotinaPadrao));
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para converter a hora "00:00" em minutos.
  --------------------------------------------------------------------------------------
*/
const tratarTime = (rotinaPadrao) => {
    let horaArray = rotinaPadrao.hora.split(":");
    rotinaPadrao.time = ((Number(horaArray[0]) * 60) + Number(horaArray[1]));
}

/*
  --------------------------------------------------------------------------------------
  Função compare utilizada na ordenação das rotinas padrão.
  --------------------------------------------------------------------------------------
*/
const compare = (a, b) => {
    if (a.time < b.time)
        return -1;
    if (a.time > b.time)
        return 1;
    return 0;
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar as rotinas padrão da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarRotinasPadraoPessoa = async (id) => {
    let url = dominio + '/rotinaspadrao?' + new URLSearchParams({
        id: id
    });
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data && data.rotinaspadrao) {
                rotinasPadrao = data.rotinaspadrao ? data.rotinaspadrao : [];
                recuperarRotinasPadraoPorDiaSemana();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir uma rotina padrão na tabela de rotinas.
  --------------------------------------------------------------------------------------
*/
const preencherListagemRotinasPadrao = (rotinaPadrao) => {
    var table = document.getElementById('tblRotinasPadrao');
    var row = table.insertRow();

    var cel1 = row.insertCell(0);
    cel1.textContent = rotinaPadrao.hora;

    var cel2 = row.insertCell(1);
    cel2.textContent = rotinaPadrao.evento;

    inserirBotaoExclucaoRotinaPadrao(row.insertCell(-1), rotinaPadrao.id)
    removeElementRotinaPadrao()
}

/*
  --------------------------------------------------------------------------------------
  Função para limpar a tabela de rotinas padrão.
  --------------------------------------------------------------------------------------
*/
const limparTableRotinasPadrao = () => {
    var tableHeaderRowCount = 1;
    var table = document.getElementById('tblRotinasPadrao');
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
        table.deleteRow(tableHeaderRowCount);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para criar o botão de exclusão de rotina padrão.
  --------------------------------------------------------------------------------------
*/
const inserirBotaoExclucaoRotinaPadrao = (parent, id) => {
    let span = document.createElement("span");
    let txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.id = id;
    span.appendChild(txt);
    parent.appendChild(span);
}

/*
  --------------------------------------------------------------------------------------
  Função para remover uma rotina padrão da tabela de rotinas.
  --------------------------------------------------------------------------------------
*/
const removeElementRotinaPadrao = () => {
    let close = document.getElementsByClassName("close");
    let i;
    for (i = 0; i < close.length; i++) {
        close[i].onclick = function () {
            let id = this.id;
            let div = this.parentElement.parentElement;
            if (confirm("Confirma a exclusão da rotina?")) {
                div.remove()
                excluirRotinaPadrao(id);
            }
        }
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para excluir uma rotina padrão da base de dados.
  --------------------------------------------------------------------------------------
*/
const excluirRotinaPadrao = (id) => {
    let url = dominio + '/rotinapadrao?id=' + id;
    fetch(url, {
        method: 'delete'
    })
        .then((response) => {
            response.json();
            rotinasPadrao = rotinasPadrao.filter(k => k.id != id);
            recuperarRotinasPadraoPorDiaSemana();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}