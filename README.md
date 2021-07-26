# TDD Demo

Este projeto tem por fim ser um exercício de desenvolvimento utilizando TDD.

---

## Premissas



---

## Arquitetura

Para iniciarmos o projeto, precisamos primeiro definir a arquitetura que queremos trabalhar, ou seja, as camadas da nossa aplicação e as devidas responsabilidades.

No nosso exemplo trabalharemos como: 

- Controllers;
- Services;
- Repositories;

### Controller

Classe responsável por orquestrar a requisição HTTP.
Corresponde ao conjunto de métodos utilizados pelo router do Express. Sendo assim, cada método público recebe um objeto request (req) e um response (res).
O controller segue o princípio de um controller de MVC: recebe a requisição e chamará os métodos auxiliares necessários para entregar a resposta ao cliente.

**Importante**: O controller não armazena nenhuma regra de negócio.

### Service

Classe responsável por isolar as regras de negócio da aplicação.
