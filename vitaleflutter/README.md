# Vitale Mobile

Aplicativo Flutter do projeto Vitale, com foco em uma triagem de sintomas
acessível para pessoas idosas. O escopo geral, os requisitos do sistema e os
diagramas estão no [README principal](../README.md).

## Situação atual

O app está em fase de protótipo navegável. O fluxo implementado é:

1. **Cadastro e login:** usa Firebase Authentication com e-mail e senha; o
   perfil e um contato de confiança são salvos no Cloud Firestore.
2. **Sinalização de sintomas:** seleciona uma ou mais regiões em um diagrama
   corporal interativo, com vistas frontal e posterior, e informa a intensidade.
   Ao avançar, a avaliação é salva na conta autenticada.
3. **Orientações e contato:** exibe as regiões selecionadas e oferece um botão
   para abrir o discador com o telefone do contato. A pessoa confirma a ligação
   no aplicativo de telefone do aparelho.

O Firebase foi configurado para Android e o provedor Email/Password está
habilitado. O código de autenticação e persistência está implementado. As regras
de [firestore.rules](firestore.rules) foram publicadas e restringem o acesso à
conta autenticada. Não há sincronização com API ou MongoDB.

## O que ainda não está implementado

- Edição de perfil e de contato de emergência.
- Recuperação de senha e verificação de e-mail.
- Sincronização com a API e o banco de dados do sistema.
- Regras de triagem clínica, identificação de gravidade e indicação de
  especialidades médicas.
- Recomendações médicas revisadas e adequadas a cada sintoma.
- Localização por GPS e envio de SMS.
- Configuração e validação em iOS. O projeto atual está configurado para
  desenvolvimento Android.

As regras ativas permitem acesso somente a `users/{uid}` e
`users/{uid}/assessments/{assessmentId}`, pelo usuário autenticado dono do UID.
Elas negam acesso aos demais caminhos do Firestore. Portanto, a Vitale-Web não
consegue ler ou gravar sua coleção atual no Firestore até que as regras sejam
alinhadas com o modelo Web. MongoDB não é afetado.

### Decisão pendente: chamada e SMS em emergência

O README principal descreve iniciar uma chamada e enviar a localização por SMS
automaticamente. Para o protótipo mobile, a decisão atual é **abrir o discador
sem iniciar a chamada**; o envio de SMS e a localização não fazem parte do fluxo
atual. Antes da implementação final, alinhar esse comportamento e os requisitos
de emergência com a equipe e atualizar a documentação principal, se essa for a
decisão definitiva.

## Estrutura do código

```text
lib/
  app/          configuração do app, rotas e tema
  controllers/  autenticação, cadastro, seleção de sintomas e discador
  models/       perfil, regiões do corpo e resultado da triagem
  repositories/ persistência de perfil e avaliações no Firestore
  services/     integração com Firebase Authentication
  views/        telas e componentes visuais
main.dart       ponto de entrada
test/           testes dos controladores e do diagrama corporal
```

O diagrama corporal é desenhado com `CustomPainter` no Flutter; não depende de
um asset externo. Os arquivos de telas de referência são ideias visuais, não
representam o comportamento clínico nem uma especificação anatômica.

## Executar

Pré-requisitos: Flutter instalado e um dispositivo ou emulador Android
disponível.

Na pasta `vitaleflutter/`, execute:

```bash
flutter pub get
flutter run
```

Para validar as alterações:

```bash
dart format lib test
flutter analyze
flutter test
flutter build apk --debug
```

O Firebase está configurado no projeto `vitale-b5e74` para o identificador
Android atual `com.example.vitaleflutter`. As opções geradas pelo FlutterFire
ficam em `lib/firebase_options.dart`. Para reconfigurar plataformas ou projeto:

```bash
dart pub global activate flutterfire_cli
flutterfire configure --project=vitale-b5e74 --platforms=android --android-package-name=com.example.vitaleflutter
```

O Firebase CLI também precisa estar instalado e autenticado na máquina. O
Firestore padrão já existe na região `southamerica-east1`. Email/Password está
habilitado no Firebase Authentication. Para republicar regras após alterações:

```bash
firebase deploy --only firestore:rules --project vitale-b5e74
```

Esse comando substitui todas as regras publicadas no projeto. Antes de ampliar o
acesso, alinhe os caminhos e a autenticação da coleção da Vitale-Web com a equipe.

## Modelo Firestore proposto

Como a conta terá somente um contato de emergência, ele fica embutido no
documento do usuário, em vez de uma coleção separada:

```text
users/{uid}
  name
  createdAt
  updatedAt
  emergencyContact
    name
    phone
    relationship

users/{uid}/assessments/{assessmentId}
  createdAt
  selectedAreas: [{ areaId, name, severity }]
```

`{uid}` é o identificador fornecido pelo Firebase Authentication. E-mail e senha
ficam no Firebase Authentication, não no documento `users`. O formato das
avaliações é inicial e precisa ser alinhado com os requisitos de triagem clínica.
No Firestore, a coleção aparece quando o primeiro documento é criado.

O botão de emergência usa `url_launcher` para abrir um endereço `tel:` no
aplicativo de telefone do dispositivo. A chamada não é iniciada diretamente
pelo Vitale.

## Acessibilidade e cuidados

- Usar linguagem simples, texto legível e controles de toque amplos.
- Manter alternativas acessíveis aos alvos interativos do diagrama.
- Não apresentar o protótipo como diagnóstico ou substituto de atendimento
  profissional.
- Validar com a equipe o conteúdo de triagem e emergência antes de disponibilizar
  recomendações clínicas.