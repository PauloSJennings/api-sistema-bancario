const { restart } = require('nodemon');
let bancoDeDados = require('../bancodedados');
const { format } = require('date-fns');
const { contas } = bancoDeDados;

function achaConta(numeroConta) {

    let conta = contas.find((conta) => conta.numero === Number(numeroConta));

    return conta;
}

function saldoSuficiente(numeroConta, valor) {

    const conta = achaConta(numeroConta);

    if (conta.saldo >= valor) {
        return true;
    } else {
        return false;
    }
}

function listaContas(req, res) {

    return res.status(200).json(bancoDeDados.contas);

}

function criaConta(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const novaConta = {
        numero: contas.length > 0 ? contas[contas.length - 1].numero + 1 : 1,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    contas.push(novaConta);

    return res.status(204).send();
}

function atualizaUsuario(req, res) {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    let conta = achaConta(numeroConta);

    conta.usuario.nome = nome
    conta.usuario.cpf = cpf
    conta.usuario.data_nascimento = data_nascimento
    conta.usuario.telefone = telefone
    conta.usuario.email = email
    conta.usuario.senha = senha

    return res.status(204).send();
}

function deletaConta(req, res) {
    const { numeroConta } = req.params;

    let conta = achaConta(numeroConta);

    if (conta.saldo > 0) {
        return res.status(403).json({ mensagem: 'A conta só pode ser removida se o saldo for zero.' })
    }

    contas.splice(contas.indexOf(conta), 1);

    return res.status(204).send();

}

function deposito(req, res) {
    const { numero_conta } = req.body;
    const { valor } = req.body;

    if (valor <= 0 || isNaN(valor)) {
        return res.status(400).json({ mensagem: 'Valor inválido.' });
    }

    let conta = achaConta(numero_conta);

    conta.saldo += valor;

    const data = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    bancoDeDados.depositos.push({
        data,
        numero_conta: Number(numero_conta),
        valor
    });

    return res.status(204).send();
}

function sacar(req, res) {
    const { numero_conta } = req.body;
    const { valor } = req.body;

    let conta = achaConta(numero_conta);

    if (valor <= 0 || isNaN(valor)) {
        return res.status(403).json({ mensagem: 'Valor inválido.' });
    }

    if (saldoSuficiente(numero_conta, valor)) {
        conta.saldo -= valor;

        const data = format(new Date(), "yyyy-MM-dd HH:mm:ss");

        bancoDeDados.saques.push({
            data,
            numero_conta: Number(numero_conta),
            valor
        });

        return res.status(204).send();
    } else {
        return res.status(403).json({ mensagem: 'Saldo insuficiente.' });
    }

}

function transeferir(req, res) {
    const { numero_conta_origem, numero_conta_destino, valor } = req.body;

    const conta_origem = achaConta(numero_conta_origem);
    const conta_destino = achaConta(numero_conta_destino);

    conta_origem.saldo -= valor;
    conta_destino.saldo += valor;

    const data = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    bancoDeDados.transferencias.push({
        data,
        numero_conta_origem: Number(numero_conta_origem),
        numero_conta_destino: Number(numero_conta_destino),
        valor
    });

    return res.status(204).send();
}

function exibeSaldo(req, res) {
    const { numero_conta } = req.query;

    const conta = achaConta(numero_conta);

    return res.status(200).json({ saldo: conta.saldo });
}

function extrato(req, res) {
    const { numero_conta } = req.query;

    const depositos = bancoDeDados.depositos.filter((deposito) => deposito.numero_conta === Number(numero_conta));
    const saques = bancoDeDados.saques.filter((saque) => saque.numero_conta === Number(numero_conta));
    const transferenciasEnviadas = bancoDeDados.transferencias.filter((transferencia) => transferencia.numero_conta_origem === Number(numero_conta));
    const transferenciasRecebidas = bancoDeDados.transferencias.filter((transferencia) => transferencia.numero_conta_destino === Number(numero_conta));

    const extrato = {
        depositos,
        saques,
        transferenciasEnviadas,
        transferenciasRecebidas
    };

    return res.status(200).json(extrato);
}

module.exports = {
    listaContas,
    criaConta,
    atualizaUsuario,
    deletaConta,
    deposito,
    achaConta,
    sacar,
    saldoSuficiente,
    transeferir,
    exibeSaldo,
    extrato
}