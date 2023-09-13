const bancoDeDados = require('../bancodedados');
const { achaConta, saldoSuficiente } = require('./banco');

function contaExisteParams(req, res, next) {
    const { numeroConta } = req.params;

    if (isNaN(numeroConta) || Number(numeroConta) < 0) {
        return res.status(400).json({ mensagem: 'Número de conta inválido' });
    }

    let conta = achaConta(numeroConta);

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta inexistente' });
    }

    next();
}

function contaExisteBody(req, res, next) {
    const { numero_conta } = req.body;

    if (!numero_conta || isNaN(numero_conta) || Number(numero_conta) < 0) {
        return res.status(400).json({ mensagem: 'Número de conta inválido' });
    }

    let conta = achaConta(numero_conta);

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta inexistente' });
    }

    next();
}

function validaSenhaBanco(req, res, next) {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(401).json({ mensagem: 'Informe a senha' });
    } else if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    next();
}

function validaSenhaUsuario(req, res, next) {
    const { senha } = req.body;
    const { numero_conta } = req.body;

    if (!senha) {
        return res.status(401).json({ mensagem: 'Informe a senha' });
    }

    const conta = achaConta(numero_conta);

    if (senha !== conta.usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    next();
}

function validacoesNovaConta(req, res, next) {
    const { numeroConta } = req.params;

    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    const emailIndisponivel = bancoDeDados.contas.find((conta) => conta.usuario.email === email);

    if (emailIndisponivel) {
        return res.status(400).json({ mensagem: 'Já existe uma conta cadastrada com esse email.' });
    }

    const cpfIndisponivel = bancoDeDados.contas.find((conta) => conta.usuario.cpf === cpf);

    if (cpfIndisponivel) {
        return res.status(400).json({ mensagem: 'Já existe uma conta cadastrada com esse cpf.' });
    }

    next();
}

function validacoesTransaferencia(req, res, next) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    const conta_origem = achaConta(numero_conta_origem);

    if (!conta_origem) {
        return res.status(400).json({ mensagem: 'Conta de origem inexistente.' });
    }

    const conta_destino = achaConta(numero_conta_destino);

    if (!conta_destino) {
        return res.status(400).json({ mensagem: 'Conta de destino inexistente.' });
    }

    if (senha !== conta_origem.usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    if (!saldoSuficiente(numero_conta_origem, valor)) {
        return res.status(403).json({ mensagem: 'Saldo insuficiente.' });
    }

    next();
}

function validacoesQuery(req, res, next) {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    const conta = achaConta(numero_conta);

    if (!conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
    }

    if (senha !== conta.usuario.senha) {
        return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    next();
}

module.exports = {
    validaSenhaBanco,
    validacoesNovaConta,
    contaExisteBody,
    contaExisteParams,
    validaSenhaUsuario,
    validacoesTransaferencia,
    validacoesQuery
}