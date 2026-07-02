# @adl/stylesheet

Parser, validador, cascata e atualização determinística do ADL Stylesheet 1.0.
O pacote não acessa filesystem, browser, layout ou React. Consumidores fornecem o
conteúdo externo pela fronteira `loadExternalStylesheet`; o resultado resolvido é
um contrato visual paralelo ao `DiagramModel`.
