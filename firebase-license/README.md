# Licenças do FluxoCerto - Cake

Backend de ativação isolado (projeto Firebase `fluxocerto-cake-lic`), sem relação com outros
produtos. Console: https://console.firebase.google.com/project/fluxocerto-cake-lic/firestore/databases/-default-/data

## Como criar uma licença nova para um cliente (gerador automático)

Rode, na raiz do projeto (`fluxocerto-cake/`):

```
npm run gerar-licenca -- --email cliente@exemplo.com --nome "Nome do cliente" --maquinas 1
```

Parâmetros (todos opcionais):

| Parâmetro    | Efeito                                                                          |
|--------------|----------------------------------------------------------------------------------|
| `--email`    | se definido, a ativação só funciona se o cliente digitar esse mesmo e-mail       |
| `--nome`     | só para identificação, não afeta a validação                                     |
| `--maquinas` | quantos aparelhos podem usar o código ao mesmo tempo (padrão: `1`)                |
| `--dias`     | validade em dias a partir de hoje (padrão: nunca expira)                          |

O script imprime o código gerado (formato `FCC-XXXX-XXXX-XXXX`) — envie esse código
(e o e-mail, se você definiu um) para o cliente ativar o app.

### Atalho na área de trabalho (sem terminal)
Existe um atalho **"Gerar Chave FluxoCerto"** na área de trabalho apontando para
`firebase-license/gerar-chave.bat`. Dois cliques nele abrem um prompt simples que
pede e-mail, nome e quantidade de aparelhos, e gera a chave sem precisar digitar
comando nenhum. Se o atalho não existir (outro computador, por exemplo), recrie
apontando para esse mesmo `.bat`.

### Configuração necessária (uma vez só)
O gerador precisa de um usuário admin autenticado no Firebase. Se o arquivo
`firebase-license/.admin-credentials.json` não existir (ele nunca é versionado no git),
rode primeiro:

```
node firebase-license/setup-admin.mjs
```

## Para revogar/bloquear uma licença
Edite o documento na coleção `licencas` (Firestore Console) e mude `ativa` para `false`.
Na próxima verificação automática (a cada 7 dias, ou na próxima tentativa de ativação),
o app do cliente perde o acesso.

## Para liberar mais aparelhos para o mesmo cliente
Aumente o valor de `maxMaquinas` no documento dele (pelo Console, já que o gerador
só cria licenças novas, não edita existentes).

## Limitação conhecida
Se o cliente compartilhar o código com outra pessoa e ainda houver "vaga" em
`maxMaquinas`, a outra pessoa também consegue ativar. Mantendo `maxMaquinas: 1`
(padrão), o código só funciona em UM aparelho por vez — é a proteção real contra
compartilhamento casual.
