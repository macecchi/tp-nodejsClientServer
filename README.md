Node.js chat - client/server chatroom
=====================

**Para executar o servidor:**

```node chat-server.js```

**Para executar um cliente:**

```node client.js <SERVER_IP_OR_HOSTNAME> <SERVER_PORT>```

A porta em que o servidor executa por padrão é a **8080**, podendo ser alterada no arquivo chat-server.js.

Caso o servidor e cliente estejam executando na mesma máquina, pode-se usar "localhost" como hostname do servidor.

## Funcionalidades
* Mensagem para a sala
* Mensagem privada (@NomeDoUsuario mensagem)
* Nome personalizado (/name NovoNome)
* Nome automático: um nome será automaticamente selecionado quando o cliente entrar na sala a partir de um set pré-definido
* Avisos para a sala quando um cliente conecta, desconecta ou muda seu nome
