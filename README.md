# ⚠️ ATENÇÃO IMPORTANTE

## 🚨 ANTES DE ENVIAR PARA O REPOSITÓRIO

### ❗ NUNCA ENVIE A PASTA `node_modules`

A pasta `node_modules` contém **dependências instaladas automaticamente** e **não deve ser versionada**.

---

## 📌 O QUE FAZER ANTES DO PUSH

✔️ Certifique-se de que a pasta `node_modules` foi removida ou ignorada:

```bash
rm -rf node_modules

---

# PASSOS PARA CONSEGUIR MUDAR O CÓDIGO

## 📥 BAIXAR O GIT SE AINDA NÃO TIVER

O Git é uma ferramenta de versionamento que permite controlar alterações no código e trabalhar em equipe.

Para instalar:

* Acesse: https://git-scm.com/
* Baixe a versão para o seu sistema operacional
* Instale normalmente (next, next, finish)

Depois, verifique se instalou corretamente:

```bash
git --version
```

---

## 📦 PEGAR O CÓDIGO (CLONE)

Para baixar o projeto do GitHub para sua máquina, use:

```bash
git clone URL_DO_REPOSITORIO
```

Exemplo:

```bash
git clone https://github.com/user/projeto.git
```

Isso cria uma cópia completa do projeto no seu computador.

---

## ✏️ COMO MUDAR O CÓDIGO

### 🔹 MAIN, BRANCHES E ORIGIN

* **main** → é a branch principal (código oficial do projeto)
* **branch** → versões paralelas para desenvolver sem quebrar a main
* **origin** → é o repositório remoto (GitHub)

---

### 🔹 ATUALIZAR O PROJETO (git pull)

Antes de começar qualquer alteração, atualize seu projeto:

```bash
git pull
```

Isso baixa as mudanças mais recentes do GitHub.

---

## 🔥 COMO VERDADEIRAMENTE MUDAR O CÓDIGO

### 🔹 CRIAR UMA BRANCH

Nunca altere direto a main. Crie uma branch:

```bash
git switch -c nome-da-branch
```

Exemplo:

```bash
git switch -c feature/remove-html-test
```

---

### 🔹 TIPOS DE BRANCH (PADRÃO PROFISSIONAL)

* `feature/` → nova funcionalidade
* `fix/` ou `bugfix/` → correção de erro
* `refactor/` → melhoria no código sem mudar comportamento
* `chore/` → tarefas técnicas (configuração, limpeza)

---

### 🔹 FAZER ALTERAÇÕES E SALVAR

Depois de editar o código:

```bash
git add .
git commit -m "descrição da alteração"
```

---

### 🔹 MANDAR PARA A MAIN (MERGE)

1. Voltar para a main:

```bash
git switch main
```

2. Atualizar:

```bash
git pull
```

3. Fazer merge:

```bash
git merge nome-da-branch
```

---

## 🚀 COMO MANDAR AS ALTERAÇÕES PARA O GITHUB

### 🔹 ENVIAR SUA BRANCH (push origin)

```bash
git push -u origin nome-da-branch
```

Exemplo:

```bash
git push -u origin feature/remove-html-test
```

---

### 🔹 EXPLICANDO O "push origin"

* `push` → envia alterações
* `origin` → repositório no GitHub
* `nome-da-branch` → qual branch será enviada

---

## 💡 FLUXO COMPLETO (RESUMO)

```bash
git clone ...
git switch -c minha-branch
# editar código
git add .
git commit -m "minha alteração"
git push -u origin minha-branch
```

Depois disso, você pode abrir um Pull Request no GitHub para integrar com a main.

---

## ⚠️ DICA FINAL

Nunca trabalhe direto na main. Sempre use branches.

Isso evita bugs, conflitos e mantém o projeto organizado.
