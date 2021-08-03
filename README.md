# TDD Demo

Este projeto tem por fim ser um exercício de desenvolvimento utilizando TDD.

## Referências de estudo

### Curso do Willam Justen específico sobre TDD
https://www.udemy.com/course/js-com-tdd-na-pratica/


### Curso do Mosh Hamedani sobre Node.js com módulo de testes e TDD
https://www.udemy.com/course/nodejs-master-class/


### Playlist de Clean Arch, TDD com Vanilla Node.js do Manguinho

<iframe width="560" height="315" src="https://www.youtube.com/embed/vV1wQ6GFH0A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
---
## Premissas

---

## Arquitetura

Para iniciarmos o projeto, precisamos primeiro definir a arquitetura que queremos trabalhar, ou seja, as camadas da nossa aplicação e as devidas responsabilidades.

No nosso exemplo trabalharemos como: 

- **Controllers**;
- **Services**;
- **Repositories**;

### Controller

Classe responsável por orquestrar a requisição HTTP.
Corresponde ao conjunto de métodos utilizados pelo router do Express. Sendo assim, cada método público recebe um objeto request (req) e um response (res).
O controller segue o princípio de um controller de MVC: recebe a requisição e chamará os métodos auxiliares dos serviços necessários para entregar a resposta ao cliente.

**Importante**: O controller não armazena nenhuma regra de negócio.

### Service

Classe responsável por isolar as regras de negócio da aplicação.

### Repository

Classe responsável por fazer a interface com as fontes de dados. 
São invocadas pelas classes de serviço

## Regra de negócio para desenvolvimento

1. Valida os campos obrigatórios
2. Verifica se já há alguma imobiliária cadastrada com mesmo campo license
    - Se houver imobiliária, não podemos seguir com o cadastro nas seguintes condições:
        - Se estiver com status ACTIVE e já estiver cadastrada na Tokio
        - Se estiver com status PENDING, já estiver cadastrada na Tokio com um status da seguradora ou possuir o campo brokerId = 0
3. Ainda no cenário de já existir a imobiliária, algumas ações precisam ser tomadas nos seguintes casos, antes de prosseguirmos no fluxo:
    - Quando o status for WAITING, deletar a imobiliária já existente do BD
    - Se o status for ACTIVE ou DISABLED e a imobiliária não for da Tokio, atualizar o cadastro para status MIGRATED e transferir a informação do campo license, para o campo oldLicense.
4. Realiza o cadastro na Tokio
    - Se o status da Tokio retornar erro mas a mensagem contiver "Parceiro de Negócio já cadastrado junto a Tokio Marine Seguradora", isso caracteriza um processo de MIGRAÇÃO.
    - Os status possíveis retornados pela tokio seriam OK, ERRO ou ANALISE.
5. Cadastra a imobiliária no BD
6. Se o status de retorno da seguradora for OK ou MIGRACAO, realiza a geração do termo
7. Se o status for OK faz a ativação do cadastro.
8. Devolve para o cliente resposta da Tokio