# Licenças do FluxoCerto - Cake

Backend de ativação isolado (projeto Firebase `fluxocerto-cake-lic`), sem relação com outros
produtos. Console: https://console.firebase.google.com/project/fluxocerto-cake-lic/firestore/databases/-default-/data

## Como criar uma licença nova para um cliente

1. Abra o console do Firestore (link acima) → coleção **licencas** (crie se não existir).
2. Clique em **Adicionar documento**.
3. **ID do documento**: o próprio código que o cliente vai digitar no app. Sugestão de formato:
   `FCC-XXXX-XXXX-XXXX` (letras maiúsculas e números, você escolhe).
4. Campos do documento:

   | Campo         | Tipo      | Valor                                                            |
   |---------------|-----------|-------------------------------------------------------------------|
   | `email`       | string    | e-mail do cliente (opcional; se preenchido, precisa bater com o e-mail digitado no app) |
   | `nome`        | string    | nome do cliente (opcional, só exibição)                          |
   | `ativa`       | boolean   | `true`                                                             |
   | `maxMaquinas` | number    | quantos aparelhos podem usar esse código ao mesmo tempo (ex: `1`) |
   | `expiracao`   | timestamp | data de expiração (opcional; deixe sem criar o campo se for vitalícia) |
   | `maquinas`    | array     | deixe **vazio** — o app preenche sozinho quando o código é ativado |

5. Salve. Pronto — o cliente já pode digitar esse código no app.

## Para revogar/bloquear uma licença
Edite o documento e mude `ativa` para `false`. Na próxima verificação automática
(a cada 7 dias, ou na próxima tentativa de ativação), o app do cliente perde o acesso.

## Para liberar mais aparelhos para o mesmo cliente
Aumente o valor de `maxMaquinas` no documento dele.

## Limitação conhecida
Se o cliente compartilhar o código com outra pessoa e ainda houver "vaga" em
`maxMaquinas`, a outra pessoa também consegue ativar. Para bloquear isso,
mantenha `maxMaquinas: 1` (padrão) — assim o código só funciona em UM aparelho por vez.
