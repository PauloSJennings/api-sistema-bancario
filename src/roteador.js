const { Router } = require('express');
const { listaContas, criaConta, atualizaUsuario, deletaConta, deposito, sacar, transeferir, exibeSaldo, extrato } = require('./controladores/banco');
const { validacoesNovaConta, contaExisteParams, contaExisteBody, validaSenhaBanco, validaSenhaUsuario, validacoesTransaferencia, validacoesQuery } = require('./controladores/intermediarios');
const rotas = Router();

rotas.get('/contas', validaSenhaBanco, listaContas);
rotas.post('/contas', validacoesNovaConta, criaConta);
rotas.put('/contas/:numeroConta/usuario', contaExisteParams, validacoesNovaConta, atualizaUsuario);
rotas.delete('/contas/:numeroConta', contaExisteParams, deletaConta);
rotas.post('/transacoes/depositar', contaExisteBody, deposito);
rotas.post('/transacoes/sacar', contaExisteBody, validaSenhaUsuario, sacar);
rotas.post('/transacoes/transferir', validacoesTransaferencia, transeferir);
rotas.get('/contas/saldo', validacoesQuery, exibeSaldo);
rotas.get('/contas/extrato', validacoesQuery, extrato);


module.exports = rotas;