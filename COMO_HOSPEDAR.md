# Como hospedar no Vercel — Passo a Passo

## 1. Crie sua conta na Anthropic (para obter a chave de API)
- Acesse: https://console.anthropic.com
- Crie uma conta gratuita
- Vá em "API Keys" e clique em "Create Key"
- Copie a chave (começa com sk-ant-...)

## 2. Crie sua conta no Vercel
- Acesse: https://vercel.com
- Clique em "Sign Up" e use sua conta do Google ou GitHub

## 3. Instale o Git (se não tiver)
- Acesse: https://git-scm.com/downloads e instale

## 4. Suba o projeto para o GitHub
Abra o terminal (Prompt de Comando no Windows) e execute:

  git init
  git add .
  git commit -m "primeiro deploy"

- Acesse https://github.com/new e crie um repositório chamado "gerador-descricoes"
- Siga as instruções do GitHub para conectar e fazer push

## 5. Importe no Vercel
- No Vercel, clique em "Add New Project"
- Conecte ao GitHub e selecione o repositório "gerador-descricoes"
- Clique em "Deploy"

## 6. Configure a chave de API (IMPORTANTE)
- No Vercel, vá em Settings > Environment Variables
- Adicione:
  Nome: ANTHROPIC_API_KEY
  Valor: sk-ant-... (sua chave da Anthropic)
- Clique em Save e depois em "Redeploy"

## 7. Pronto!
- O Vercel vai te dar um link como: https://gerador-descricoes.vercel.app
- Compartilhe esse link com sua equipe!
