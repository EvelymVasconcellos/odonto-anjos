# Dados pendentes de confirmação (Odonto Anjos)

Tudo fica em `src/site.config.js`. Nada abaixo foi inventado: onde falta informação, o site mostra
orientação ou um espaço reservado sinalizado.

## Marca
- [x] Logomarca oficial (monograma OA com asa) — aplicada no site e no cartão. Se houver versão vetorial (SVG/PDF), substituir para nitidez máxima.
- [ ] Dados da Dra. Cíntia dos Anjos: CRO-RJ, especialidades registradas e formação
      (`content.professional.cro` e `qualifications`: o site só exibe quando preenchidos).
      O jaleco nas fotos diz "Ortodontista"/"Ortodontia"; o site não publica especialidade até a confirmação do registro.
- [ ] Autorização por escrito para uso das sete fotografias (imagem da profissional).
- [ ] Responsável técnico (nome e CRO) para o rodapé (`legal.technicalResponsible`) — exigência
      de publicidade odontológica (CFO); o rodapé só mostra quando preenchido.

## Unidade Cosmos
- [ ] Endereço completo e CEP (Rua Afonso de Carvalho, 33, Vila do Céu).
- [ ] Confirmar se (21) 98680-7980 é desta unidade e se é WhatsApp.
- [ ] Horários de funcionamento.
- [ ] Foto da fachada da unidade.

## Unidade Santa Cruz
- [ ] Confirmar horários da fachada (seg–sex 9h–18h, sáb 9h–12h) e marcar `hoursPending: false`.
- [ ] WhatsApp/telefone da unidade (`units[1].whatsapp`).
- [ ] Foto da fachada (`units[1].image`).

## Ambas
- [ ] Coordenadas (`geo`) para ativar a sugestão automática da unidade mais próxima.
- [ ] Serviços disponíveis em cada unidade (`units[].services`).
- [ ] Planos aceitos e formas de pagamento (se a clínica quiser listar).
- [ ] Outros profissionais (se a clínica quiser apresentar): foto, área de atuação, CRO e unidade.
- [ ] Em qual unidade fica cada consultório fotografado (hoje as legendas não citam unidade).
- [ ] Publicações autorizadas do Instagram para o site (`contact.instagram.posts`: imagem, texto
      alternativo e link). Sem elas, a seção mostra fotos da clínica e o link do perfil.
- [ ] Depoimentos autorizados (a seção de avaliações saiu desta versão; pode voltar quando houver).
- [ ] URL definitiva do site (`seo.siteUrl`, `siteUrlConfirmed`) — libera canonical correto, sitemap e QR Code.
- [ ] Revisão da Política de Privacidade pela clínica.
