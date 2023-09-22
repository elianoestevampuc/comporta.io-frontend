
let dominio = "http://127.0.0.1:5000";

let diasSemanaPadraoDia = [
    { id: 1, dia: 'seg', util: true },
    { id: 2, dia: 'ter', util: true },
    { id: 3, dia: 'qua', util: true },
    { id: 4, dia: 'qui', util: true },
    { id: 5, dia: 'sex', util: true },
    { id: 6, dia: 'sab', util: false },
    { id: 0, dia: 'dom', util: false },
]

const retornarDiaSemana = (data) => {
    let d = data.getDay();
    let s = diasSemanaPadraoDia.filter(f => f.id == d);
    let diaSemana = s[0].dia;
    return diaSemana;
}