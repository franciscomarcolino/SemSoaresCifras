# Áudios de ensaios

Guardar futuras faixas em uma subpasta por ensaio, por exemplo `8/ThisLove-Maroon5.mp3`.
No registro correspondente de `data/ensaios.json`, adicionar o campo opcional `audios`, um objeto que relaciona o ID da música ao caminho relativo à página:

```json
"audios": { "59": "data/audios/ensaios/8/ThisLove-Maroon5.mp3" }
```

O exemplo é apenas documentação: nenhum áudio está cadastrado. Preservar o array musicas e seus IDs. A mesma música pode ter gravações diferentes em ensaios diferentes. Sem referência, o ícone fica indisponível. Com referência, abre a faixa em nova aba. Publicar apenas gravações aprovadas pelo usuário; o áudio do teste cancelado não deve ser usado.
