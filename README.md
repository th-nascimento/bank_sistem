# Sistema Bancário Simples

Este é um sistema bancário simples desenvolvido em Node.js, com o objetivo de simular operações básicas de um banco, como abrir conta, fazer login, consultar saldo, depositar, sacar e transferir entre contas.

## Funcionalidades

- Abrir conta: Permite que o usuário crie uma nova conta bancária.
- Fazer login: Permite que o usuário faça login em uma conta existente.
- Consultar saldo: Mostra o saldo disponível na conta do usuário.
- Depositar: Permite que o usuário deposite dinheiro em sua conta.
- Sacar: Permite que o usuário saque dinheiro de sua conta.
- Transferência entre contas: Permite que o usuário transfira dinheiro entre suas contas corrente e poupança.
- Encerrar sessão: Encerra a sessão atual do usuário.

## Pré-requisitos

- Node.js instalado
- npm (Node Package Manager)

## Instalação

1. Clone este repositório para o seu sistema local.
2. No terminal, navegue até o diretório do projeto.
3. Execute o comando `npm install` para instalar as dependências.

## Como usar

1. No terminal, navegue até o diretório do projeto.
2. Execute o comando `npm start` para iniciar o sistema.
3. Siga as instruções fornecidas pelo sistema para realizar as operações desejadas.

## Estrutura do projeto

- `index.js`: Arquivo principal que inicia o sistema e gerencia a interação com o usuário.
- `tool_modules.mjs`: Módulo contendo funções utilitárias para manipulação de arquivos e tratamento de erros.
- `operation_modules.mjs`: Módulo contendo as principais operações do sistema, como login, abrir conta, depositar, sacar, etc.
- `data_base/accounts`: Diretório contendo os arquivos JSON que representam as contas bancárias dos usuários.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue para relatar problemas, sugerir melhorias ou enviar pull requests.

## Licença

Este projeto está licenciado sob a [MIT License](https://opensource.org/licenses/MIT).
