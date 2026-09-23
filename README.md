Desenvolvido por: **Lucas Yuji Sapia Furukawa [RA: 176581]**
> Universidade Federal de São Paulo (UNIFESP) - Bacharelado em Ciência e Tecnologia (BCT)

# Exercícios de Computação Gráfica 2026.2
Este repositório contém os exercícios práticos desenvolvidos para as aulas de Computação Gráfica. O objetivo principal dos projetos é explorar conceitos fundamentais de renderização geométrica bidimensional diretamente no navegador utilizando a API do WebGL2.

## Exercícios Propostos

Clique nos links abaixo para navegar até a pasta de cada implementação:

L **[Intro WebGL](./Intro%20WebGL)**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L Renderização de primitivas geométricas 2D básicas no WebGL, criando figuras compostas (Flor, Robô e Carro) através da manipulação direta de vértices e cores nos shaders.

L **[Algoritmo de Bresenham](./Bresenham)**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L Implementação puramente matemática do algoritmo de Bresenham para traçar retas e triângulos "pixel a pixel" com o mouse, incluindo um sistema dinâmico de cores indexadas (teclas 0 a 9).

L **[Pong Game Completo](./Pong%20Completo)**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L Desenvolvimento de um jogo de Pong interativo e funcional em WebGL2. Inclui controle de raquetes independentes via teclado (W/S e Setas), sistema de detecção de colisão matemática, cálculo de rebotes e placar dinâmico.

L **[Animação POO](./Animação%20POO)**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L Aplicação de Programação Orientada a Objetos (POO) para criar um grafo de cena (Scene Graph) bidimensional. O projeto demonstra o uso de hierarquia espacial através de operações de matrizes, animando independentemente os membros de um robô (braços, pernas, cabeça e tronco).

L **[Helicóptero](./Helicóptero)**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L Modelagem hierárquica e animação de um helicóptero 3D usando grafos de cena em WebGL2. O helicóptero se desloca pelo canvas através das setas do teclado (cima, baixo, esquerda, direita) e sofre inclinações condizentes com a inércia do movimento, enquanto as hélices (superior e cauda) mantêm sua rotação local ininterrupta.

---

## Tecnologias Utilizadas
* HTML5 & CSS3 para a estruturação.
* JavaScript puro (Vanilla) para a lógica matemática e controle da API.
* WebGL2 (Vertex e Fragment Shaders).

## Como Executar
Para visualizar as práticas, basta clonar este repositório e abrir o arquivo `index.html` principal em qualquer navegador web moderno compatível com WebGL. Não é necessário instalar pacotes, dependências ou configurar servidores locais.
