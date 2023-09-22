/* 
  --------------------------------------------------------------------------------------
  Modal com formuláro de cadastro de rotina do dia. 
  --------------------------------------------------------------------------------------
*/
const modalCadastroRotinaDia = new bootstrap.Modal('#modalCadastroRotinaDia');

let dataAtual = new Date();
let rotinasPadraoDia = [];
let rotinasDoDia = [];
let diaSemanaRotinaDia = retornarDiaSemana(dataAtual);
document.getElementById("dataAtual").innerHTML = dataAtual.toLocaleDateString() + ' ' + diaSemanaRotinaDia.toUpperCase();

/*
  --------------------------------------------------------------------------------------
  Função para recuperar os dados da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarPessoaRotinaDia = async (id) => {
    let url = dominio + '/pessoa?' + new URLSearchParams({
        id: id
    });
    fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            this.pessoa = data;
            document.getElementById("nomePessoaRotinaDia").innerHTML = this.pessoa.nome;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar as rotinas do dia.
  --------------------------------------------------------------------------------------
*/
const recuperarRotinasDia = async () => {
    const formData = new FormData();
    formData.append('id_pessoa', this.pessoa.id);
    formData.append('data_execucao', (dataAtual.toLocaleDateString()).split("/").reverse().join("-")+'T00:00:00');
    let url = dominio + '/rotinasdia';
    fetch(url, {
        method: 'post',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            rotinasDoDia = data.rotinasdia;
            recuperarRotinasPadraoDiaPorDiaSemana();
            console.log('ROTINAS DO DIA', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para abrir o modal com formulário de cadastro de rotina do dia.
  --------------------------------------------------------------------------------------
*/
const abrirModalCadastroRotinaDia = (id) => {

    dataAtual = new Date();
    diaSemanaRotinaDia = retornarDiaSemana(dataAtual);
    document.getElementById("dataAtual").innerHTML = dataAtual.toLocaleDateString() + ' ' + diaSemanaRotinaDia.toUpperCase();

    recuperarPessoaRotinaDia(id);
    recuperarRotinasPadraoDiaPessoa(id);
    modalCadastroRotinaDia.show();
}

/*
  --------------------------------------------------------------------------------------
  Função para fechar o modal com formulário de cadastro de rotina do dia.
  --------------------------------------------------------------------------------------
*/
const fecharModalCadastroRotinaDia = () => {
    modalCadastroRotinaDia.hide();
}

/*
  --------------------------------------------------------------------------------------
  Função de navegação entre datas, voltar 1 dia.
  --------------------------------------------------------------------------------------
*/
const voltarDia = () => {
    dataAtual.setDate(dataAtual.getDate() - 1);
    diaSemanaRotinaDia = retornarDiaSemana(dataAtual);
    document.getElementById("dataAtual").innerHTML = dataAtual.toLocaleDateString() + ' ' + diaSemanaRotinaDia.toUpperCase();
    recuperarRotinasDia();
}

/*
  --------------------------------------------------------------------------------------
  Função de navegação entre datas, avançar 1 dia.
  --------------------------------------------------------------------------------------
*/
const avancarDia = () => {
    dataAtual.setDate(dataAtual.getDate() + 1);
    diaSemanaRotinaDia = retornarDiaSemana(dataAtual);
    document.getElementById("dataAtual").innerHTML = dataAtual.toLocaleDateString() + ' ' + diaSemanaRotinaDia.toUpperCase();
    recuperarRotinasDia();
}

/*
  --------------------------------------------------------------------------------------
  Função para recuperar as rotinas padrão da pessoa.
  --------------------------------------------------------------------------------------
*/
const recuperarRotinasPadraoDiaPessoa = async (id) => {
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
                rotinasPadraoDia = data.rotinaspadrao ? data.rotinaspadrao : [];
                recuperarRotinasDia();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

/*
  --------------------------------------------------------------------------------------
  Função para filtrar as rotinas padrão por dia da semana.
  --------------------------------------------------------------------------------------
*/
const recuperarRotinasPadraoDiaPorDiaSemana = () => {
    //limparTableRotinasPadrao();

    document.getElementById("rowRotinaDia").innerHTML = "";
    definirDivReader();

    //Loop nas rotina paara converter a informação da hora em minutos.
    rotinasPadraoDia.forEach(rotinaPadrao => tratarTimeDia(rotinaPadrao));
    //Filtra as rotinas padrão por dia da semana;
    let rotinasPadraoDiaSemana = rotinasPadraoDia.filter(k => k.diasemana == diaSemanaRotinaDia);

    if (rotinasPadraoDiaSemana) {
        //Realiza a ordenação pela hora.
        rotinasPadraoDiaSemana.sort(compare);
        preencherListagemRotinasPadraoDia(rotinasPadraoDiaSemana);
    }
}

/*
  --------------------------------------------------------------------------------------
  Função para definir o conteúdo de reader da div das rotinas padrão.
  --------------------------------------------------------------------------------------
*/
const definirDivReader = () => {
    let conteudo = `
                    <div class="row" style="border-bottom: solid 1px #ccc;background-color: #eee;">
                        <div class="col-md-3">Hora</div>
                        <div class="col-md-5">Evento</div>
                        <div class="col-md-4" style="text-align: center;">
                            Realizado?
                        </div>
                    </div>
    ` ;
    document.getElementById("rowRotinaDia").innerHTML = conteudo;
}

/*
  --------------------------------------------------------------------------------------
  Função para converter a hora "00:00" em minutos.
  --------------------------------------------------------------------------------------
*/
const tratarTimeDia = (rotinaPadrao) => {
    let horaArray = rotinaPadrao.hora.split(":");
    rotinaPadrao.time = ((Number(horaArray[0]) * 60) + Number(horaArray[1]));
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir uma rotina padrão na tabela de rotinas padrão.
  --------------------------------------------------------------------------------------
*/
const preencherListagemRotinasPadraoDia = (rotinas) => {
    // Loop para criae a div de cada rotina padrão.
    for (let rotinaPadrao of rotinas) {
        let conteudo = `
        <div class="row rowRotinaPadrao" style="border-bottom: solid 1px #ccc;">
            <div class="col-md-3">
                `+ rotinaPadrao.hora + `
            </div>
            <div class="col-md-5">
                `+ rotinaPadrao.evento + `
            </div>
            <div class="col-md-4" style="text-align: center;padding-left: 2.5em;">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="checkbox_`+ rotinaPadrao.id + `" onclick="onChangeRealizou(` + rotinaPadrao.id + `);" role="switch"
                        id="flexSwitchCheckDefault">
                </div>
            </div>
        </div>    
        `;
        document.getElementById("rowRotinaDia").innerHTML += conteudo;
    }

    // Loop para marcar ou não a execução da tarefa.
    for (let rotinaPadrao of rotinas) {
        let rd = rotinasDoDia.filter(l => l.hora == rotinaPadrao.hora && l.id_evento == rotinaPadrao.id_evento);
        if (rd && rd.length > 0) {
            document.getElementById("checkbox_" + rotinaPadrao.id).checked = rd[0].executou;
        }
    }
}

const onChangeRealizou = (id) => {
    let rotinaPadraoArray = rotinasPadraoDia.filter(k => k.id == id);
    let rotinaDia = {
        hora: rotinaPadraoArray[0].hora,
        id_evento: rotinaPadraoArray[0].id_evento,
        id_pessoa: rotinaPadraoArray[0].id_pessoa,
        executou: 0,
        data_execucao: converterDataString()+'T00:00:00'
    };

    if (document.getElementById('checkbox_' + id).checked) {
        rotinaDia.executou = 1;
    }

    salvarRotinaDia(rotinaDia);
}

const converterDataString = () => {
    let d = dataAtual.toLocaleDateString();
    let da = d.split('/');
    return da[2] + '-' + da[1] + '-' + da[0];
}

const salvarRotinaDia = async (rotinaDia) => {
    const formData = new FormData();
    formData.append('hora', rotinaDia.hora);
    formData.append('id_evento', rotinaDia.id_evento);
    formData.append('id_pessoa', rotinaDia.id_pessoa);
    formData.append('executou', rotinaDia.executou);
    formData.append('data_execucao', rotinaDia.data_execucao);
    let url = dominio + '/rotinadia';
    fetch(url, {
        method: 'post',
        body: formData
    })
        .then((response) => {
            if (response.status == 200) {

            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}