---
title: "Vitae, nunc orci eu congue gravida."
description: "Nulla ullamcorper pellentesque vestibulum arcu ut eu arcu nisi neque."
image: "../../public/images/post3.png"
author: "Roman Zaikin"
date: "November 11, 2021"
day: "17"
month: "11"
year: "2021"
---

Alexa, da Amazon, foi exposta a violações de segurança, em um estudo realizado pela empresa Check Point descobriu Dikla Barda, Yaara Shrikki e Roman Zaikin que os hackers podem obter acesso completo às informações do usuário, remover e instalar aplicativos remotamente e assumir o controle de seus produtos inteligentes.

Assistentes pessoais inteligentes se tornaram uma parte essencial de nossas vidas, seja Siri no telefone ou Alexa em casa, neste estudo apresentaremos as falhas de segurança que encontramos na assistente pessoal Alexa, descreveremos as etapas da pesquisa e como conseguimos dominar produtos inteligentes conectados a Alexa.

Nossos resultados mostram que alguns dos subdomínios da Amazon são vulneráveis ​​como CORS Misconfiguration, Cross-site Request Forgery (CSRF) e também Cross Site Scripting(XSS).

Combinar essas descobertas nos permitiu com apenas um clique:

- Remover e instale novos recursos em sua conta Alexa remotamente.
- Obtenha uma lista de todos os recursos instalados no Alexa.
- Receber histórico de comandos de voz, incluindo suas conversas.
- Receber informações confidenciais através do Alexa.

E tudo isso clicando em apenas um link malicioso que um invasor poderia ter enviado ao seu alvo. Veja um Vídeo de demonstração:

<div class="videoWrapper"><iframe width="560" height="315" src="https://youtube.com/embed/xfqGYic4hj8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe></div>

Reportamos à Amazon em junho de 2020 e eles corrigiram todas as descobertas imediatamente.

---

# Detalhes Técnicos

Começamos a pesquisa baixando o aplicativo Alexa para o nosso telefone e configuramos um proxy para ver todas as informações enviado do aplicativo para o servidor através do Burp Suite, mas infelizmente vimos que a Amazon implementou proteções incorporadas que verificam o certificado digital no lado do aplicativo antes de enviar, essa proteção é chamada de SSL Pinning.

Para contornar a fixação de SSL, usamos o método que também ensinamos no curso [Nosso curso de hacking para aplicativos móveis](/cyber_ads) No qual Permite desligar SSL Pinning utilizando Frida e o seguinte simples script:

[https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/](https://codeshare.frida.re/@pcipolloni/universal-android-ssl-pinning-bypass-with-frida/)

Depois de contornar o SSL Pinning, olhamos para o tráfego de passagem e vimos que a Amazon não configurou CORS corretamente e seria possível enviar uma solicitação Ajax de qualquer subdomínio da Amazon para o aplicativo Alexa.

Isso não foi algo planejado e após nosso relatório a Amazon corrigiu esta configuração CORS.

O pedido é esse:  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-2.png)  
E a resposta é essa:  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-3.png)  
Esta configuração permite que qualquer subdomínio da Amazon envie uma solicitação ajax para Alexa, portanto, se tivermos XSS em qualquer domínio, podemos iniciar o ataque e tentar assumir o Alexa.

Então saímos de um ponto de presunção de que estamos apenas um XSS abaixo de nosso objetivo e olhamos quais informações podem ser obtidas por meio da API no Ajax se enviarmos uma solicitação de qualquer domínio, por exemplo track.amazon.com.

Para nossa surpresa, a resposta a uma das solicitações também retorna o csrfToken de que precisamos para realizar ações de nome de usuário.  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-4.png)  
Portanto, agora temos a configuração incorreta do CORS e o token CSRF para executar operações de um usuário que clica em nosso link.

Até agora vimos que temos a capacidade de gerenciar remotamente o alexa de quem clica em nosso link, ter todas as suas conversas com Alexa, Remover recursos e instalalar novos recursos, etc.

Para que tudo isso funcione, agora precisamos encontrar uma injeção de código que irá completar nossa operação, passamos por algumas dezenas de subdomínios da Amazon até chegarmos a track.amazon.com que contém 2 parâmetros:

- pageSize
- paginationToken

Se inserirmos um caractere que não é contado em pageSize, obteremos um erro de um servidor cujo tipo de conteúdo é text/html E reflete as informações que colocamos em pageSize para que a Amazon tenha um erro XSS na resposta a um parâmetro incorreto na página:  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-5.png)  
E é assim que se parece a resposta ao pedido:  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-6.png)  
Para que tenhamos a imagem completa, usaremos a injeção de código para extrair o token csrf e salvá-lo no parâmetro csrf.  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-7.png)  
E usaremos este csrf para enviar uma solicitação de instalação para um skill (habilidade) com o ID B07KKJYFS9 no alexa do destino.  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-8.png)  
O ID pode ser removido da loja Alexa depois de fazer upload do Skill para a loja deles.  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-9.png)  
Clicar no link malicioso adicionará a habilidade à conta do usuário e a instalará em seu alexa.  
![Lista de arquivos carregados durante a execução do messenger](/img/blog/2020/alexa-8-10.png)  
No exemplo, instalamos a habilidade da loja Amazon Prime Inside. É importante observar que durante o processo de pesquisa a pedido da Amazon, não carregamos uma habilidade maliciosa em sua loja de aplicativos e a deixamos no estado Developer.

---

# Attack flow

O ataque poderia ter sido realizado de várias e variadas formas abaixo é um exemplo:

- O alvo clica em um link que recebeu em um e-mail para o produto amazon
- O link passa o alvo para o site track.amazon.com que executa a injeção de código
- Um pedido será feito utilizando csrf token
- Uma solicitação é enviada para uma lista de recursos instalados no dispositivo
- O atacante substitui uma das habilidades na habilidade que escreveu
- O atacante assume o alexa.

Você gostou do estudo? Você também quer estudar segurança da informação? Sinta-se à vontade para participar do nosso curso  
[Programa completo do curso de guerra cibernética](/cyber_ads)
