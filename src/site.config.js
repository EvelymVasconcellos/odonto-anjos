/* =====================================================================
   ODONTO ANJOS — fonte única de dados do site e do cartão digital.

   Tudo o que é conteúdo (nome, unidades, endereços, telefones, horários,
   tratamentos, equipe, textos e SEO) mora aqui. O build (scripts/build.mjs)
   gera o HTML final de dist/ a partir deste arquivo, e o navegador também
   o carrega (window.SITE_CONFIG) para o seletor de unidades e o WhatsApp.

   Campos com `pending` / "a confirmar" ainda não foram validados pela
   clínica. A lista completa está em PENDENCIAS.md.
   ===================================================================== */
(function (root) {
var SITE_CONFIG = {

  /* ---------- MODO DEMONSTRAÇÃO ----------
     enabled: true  → aviso discreto no hero e no rodapé; antes de abrir o
                      WhatsApp, um modal mostra a mensagem e o número.
     enabled: false → os botões abrem o WhatsApp direto (versão final). */
  demo: {
    enabled: true,
    pill: "Projeto demonstrativo · EV",
    notice: "Projeto demonstrativo desenvolvido pela EV | Design, Tecnologia e Soluções Digitais.",
    agency: { name: "EV | Design, Tecnologia e Soluções Digitais", label: "Conheça a EV", url: "https://evelymvasconcellos.com" }
  },

  /* ---------- MARCA ---------- */
  brand: {
    name: "Odonto Anjos",
    professional: "Dra. Cíntia dos Anjos",
    slogan: "Um sorriso abre oportunidades.",
    // Logomarca oficial (monograma OA com asa, dourado). Arquivos recortados e otimizados em assets/brand/.
    logo: { base: "assets/brand/logo-oa", heights: [48, 96, 144], w: 1134, h: 939, alt: "" },
    favicon: "assets/brand/favicon-32.png",
    faviconHi: "assets/brand/favicon-oa.png",
    appleTouch: "assets/brand/apple-touch-icon.png",
    ogImage: "assets/brand/og-image.png",
    themeColor: "#FFFBF2"
  },

  /* ---------- IDENTIDADE VISUAL ----------
     Paleta angelical do site institucional (proposta EV, não especificação oficial da marca).
     Base branca e marfim; amarelo e dourado como destaques. O cartão digital tem tema próprio,
     congelado em scripts/build.mjs (CARD_THEME). */
  theme: {
    colors: {
      yellow:     "#F5C842",  // amarelo angelical: destaques e botão principal
      gold:       "#D4A43C",  // dourado
      goldDark:   "#A77D2F",  // dourado escuro: ícones e linhas
      goldInk:    "#7A5A1E",  // dourado para texto pequeno (contraste AA sobre branco/marfim)
      yellowSoft: "#FFF3C4",  // amarelo suave
      bg:         "#FFFFFF",  // branco
      bgSoft:     "#FFFBF2",  // marfim
      text:       "#292724",  // grafite
      textSoft:   "#67635D",  // cinza secundário
      line:       "#EFE6D2",
      focus:      "#1F5FA8"
    },
    // Degradê dourado da marca (detalhes e destaques, com moderação)
    gradient: "linear-gradient(115deg, #FFF1BA 0%, #D4A43C 32%, #A77D2F 58%, #F5C842 82%, #FFF0AF 100%)",
    // Degradê da palavra "transforma" (especificação aprovada)
    textGradient: "linear-gradient(115deg, #A77D2F 0%, #D4A43C 35%, #B68B30 65%, #8E6825 100%)",
    fonts: {
      display: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
      body: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      editorial: '"Playfair Display", Georgia, "Times New Roman", serif',
      googleHref: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap"
    }
  },

  /* ---------- FOTOGRAFIAS REAIS ----------
     Mapa completo (nome original → nome no site) em assets-src/fotos/MAPA-DAS-IMAGENS.md.
     widths: larguras geradas em WebP; w/h: proporção original. */
  photos: {
    hero:      { base: "assets/images/odonto-anjos/07-hero-logo-dourado", widths: [640, 1000, 1440], w: 1440, h: 1358, alt: "Dra. Cíntia dos Anjos sorrindo e apontando para a logomarca dourada da Odonto Anjos na parede da clínica" },
    aboutSecond: { base: "assets/images/odonto-anjos/02-sobre-consultorio", widths: [640, 1156], w: 1156, h: 777, alt: "Dra. Cíntia dos Anjos de braços cruzados no consultório, ao lado da cadeira e dos equipamentos odontológicos" },
    ortho:     { base: "assets/images/odonto-anjos/06-ortodontia-modelo", widths: [480, 800, 1185], w: 1185, h: 1440, alt: "Mãos da profissional segurando um modelo de arcada com aparelho ortodôntico" },
    structure: { base: "assets/images/odonto-anjos/05-estrutura-logo-vermelho", widths: [640, 1100, 1440], w: 1440, h: 1015, alt: "Consultório da Odonto Anjos com a logomarca na parede e a profissional ao lado da cadeira odontológica" },
    chair:     { base: "assets/images/odonto-anjos/04-estrutura-cadeira", widths: [640, 1100], w: 1440, h: 1000, alt: "Profissional sentada junto à cadeira odontológica, com refletor e equipamentos do consultório" },
    portrait:  { base: "assets/images/odonto-anjos/01-dra-cintia-retrato", widths: [480, 800, 1080], w: 1080, h: 1344, alt: "Retrato da Dra. Cíntia dos Anjos de jaleco branco, segurando um instrumento odontológico" }
  },

  /* Carrosséis: chave da foto + enquadramento (object-position) para não cortar rostos nem a logomarca */
  galleries: {
    about:     [ { photo: "hero", pos: "62% 26%" }, { photo: "aboutSecond", pos: "24% 38%" } ],
    structure: [ { photo: "structure", pos: "52% 40%" }, { photo: "chair", pos: "38% 48%" } ]
  },

  /* ---------- MASCOTE ---------- */
  mascot: {
    // Loop de 1,33 s (quadros 156–195 do vídeo original), emenda sem salto; WebP animado com
    // transparência em todos os navegadores. O quadro estático é o primeiro quadro do loop.
    loop: { 640: "assets/mascot/anjo-loop-640.webp", 420: "assets/mascot/anjo-loop-420.webp" },
    still: { 640: "assets/mascot/anjo-still-640.webp", 420: "assets/mascot/anjo-still-420.webp" },
    w: 976, h: 622,
    alt: "Mascote da Odonto Anjos: um dentinho com asas e auréola douradas, voando e fazendo joinha"
  },

  /* ---------- CANAIS GERAIS ---------- */
  contact: {
    instagram: {
      handle: "@odonto_anjoss",
      url: "https://www.instagram.com/odonto_anjoss/",
      // Publicações autorizadas para exibir no site: { image, alt, url }. Vazio = mostra fotos da clínica.
      posts: []
    },
    // Link público de avaliações (Google). Enquanto não houver o perfil oficial, abre a busca no Google Maps.
    reviewsUrl: "https://www.google.com/maps/search/?api=1&query=Odonto+Anjos+Rio+de+Janeiro",
    whatsappMessage: "Olá! Conheci a Odonto Anjos pelo site e gostaria de informações para agendar uma avaliação na unidade de {unidade}.",
    whatsappMessageTreatment: "Olá! Conheci a Odonto Anjos pelo site e gostaria de informações sobre {tratamento} na unidade de {unidade}."
  },

  /* ---------- UNIDADES ----------
     whatsapp: só números com DDI (ex.: 5521986807980). Vazio = não cadastrado:
     o site mostra orientação em vez de gerar um link inválido.
     geo: { lat, lng } — preencher com as coordenadas confirmadas para ativar a
     sugestão automática da unidade mais próxima. */
  units: [
    {
      id: "cosmos",
      name: "Odonto Anjos — Cosmos",
      short: "Cosmos",
      street: "Rua Afonso de Carvalho, 33",
      district: "Vila do Céu, Cosmos",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "",
      phone: "(21) 98680-7980",
      whatsapp: "5521986807980",
      contactPending: true,         // vínculo do telefone com a unidade a confirmar
      addressPending: true,         // endereço completo e CEP a confirmar
      openingHours: [],             // ainda não informados
      hoursPending: true,
      services: null,               // null = não configurado (não presumir os mesmos serviços)
      image: "",
      imageAlt: "",
      geo: null
    },
    {
      id: "santa-cruz",
      name: "Odonto Anjos — Santa Cruz",
      short: "Santa Cruz",
      street: "Avenida Cesário de Melo, 13992",
      district: "Santa Cruz",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "23590-060",
      phone: "",
      whatsapp: "",                 // ainda não informado
      contactPending: true,
      addressPending: false,
      openingHours: [
        { days: "Segunda a sexta", hours: "9h às 18h", schema: "Mo-Fr 09:00-18:00" },
        { days: "Sábado", hours: "9h às 12h", schema: "Sa 09:00-12:00" }
      ],
      hoursPending: true,           // horários exibidos na fachada, a confirmar
      services: null,
      image: "",                    // foto da fachada: assets/img/fachada-santa-cruz.webp quando enviada
      imageAlt: "Fachada da unidade Odonto Anjos em Santa Cruz",
      geo: null
    }
  ],

  /* ---------- TRATAMENTOS ----------
     Lista do cartão digital atual. A disponibilidade por unidade ainda não
     foi informada (units[].services = null). */
  treatmentCategories: [
    { id: "odontologia", label: "Odontologia" },
    { id: "estetica", label: "Estética orofacial" }
  ],
  treatments: [
    { id: "ortodontia", cat: "odontologia", name: "Aparelhos ortodônticos", text: "Alinham os dentes e a mordida." },
    { id: "limpeza", cat: "odontologia", name: "Limpeza dentária", text: "Remove placa e tártaro. Base da prevenção." },
    { id: "raio-x", cat: "odontologia", name: "Raio-X", text: "Mostra o que não se vê a olho nu." },
    { id: "canal", cat: "odontologia", name: "Tratamento de canal", text: "Trata a parte interna do dente." },
    { id: "extracoes", cat: "odontologia", name: "Extrações", text: "Remoção do dente, quando indicada." },
    { id: "proteses", cat: "odontologia", name: "Prótese dentária", text: "Repõe dentes perdidos, fixa ou removível." },
    { id: "implantes", cat: "odontologia", name: "Implantes", text: "Substituem a raiz e recebem uma coroa." },
    { id: "obturacoes", cat: "odontologia", name: "Obturações", text: "Restauram dentes com cárie ou fratura." },
    { id: "clareamento", cat: "odontologia", name: "Clareamento dental", text: "Clareia a cor dos dentes, após avaliação." },
    { id: "laser", cat: "estetica", name: "Laserterapia", text: "Laser de baixa potência como apoio ao tratamento." },
    { id: "harmonizacao", cat: "estetica", name: "Harmonização orofacial", text: "Procedimentos para o equilíbrio do rosto." },
    { id: "toxina", cat: "estetica", name: "Toxina botulínica (Botox)", text: "Relaxa músculos específicos do rosto." },
    { id: "labial", cat: "estetica", name: "Preenchimento labial", text: "Volume ou contorno dos lábios." },
    { id: "sulcos", cat: "estetica", name: "Tratamento de sulcos faciais", text: "Suaviza sulcos do rosto." },
    { id: "bichectomia", cat: "estetica", name: "Bichectomia", text: "Reduz as bolsas de gordura das bochechas." },
    { id: "fios", cat: "estetica", name: "Fios de sustentação", text: "Apoio à sustentação da pele do rosto." },
    { id: "papada", cat: "estetica", name: "Fio-lipo de papada", text: "Procedimento voltado à região da papada." },
    { id: "microagulhamento", cat: "estetica", name: "Microagulhamento facial", text: "Microperfurações controladas na pele." },
    { id: "limpeza-facial", cat: "estetica", name: "Limpeza facial", text: "Higienização profunda da pele do rosto." }
  ],

  /* ---------- PROFISSIONAIS ----------
     A apresentação da Dra. Cíntia está em content.professional. Outros
     profissionais só entram aqui depois de validados (nome, área, CRO, unidade, foto). */
  team: [],

  /* ---------- AVALIAÇÕES ----------
     Apenas depoimentos reais e autorizados: { text, author, unit }. */
  reviews: [],

  /* ---------- RESPONSÁVEL TÉCNICO (publicidade odontológica — CFO) ---------- */
  legal: {
    technicalResponsible: { name: "", cro: "" },
    technicalPlaceholder: ""   // o rodapé só mostra o responsável técnico quando nome e CRO forem preenchidos
  },

  /* ---------- SEO ---------- */
  seo: {
    siteUrl: "https://odonto-anjos.pages.dev",   // provisório (Cloudflare Pages)
    siteUrlConfirmed: false,                    // true libera o QR Code do cartão
    locale: "pt_BR",
    lang: "pt-BR",
    robots: "noindex, nofollow",                // demonstração: fora dos buscadores
    pages: {
      home: {
        title: "Odonto Anjos | Dentista em Cosmos e Santa Cruz, RJ",
        description: "Clínica odontológica Odonto Anjos, com unidades em Cosmos e Santa Cruz, Zona Oeste do Rio de Janeiro. Conheça os tratamentos e agende sua avaliação pelo WhatsApp."
      },
      card: {
        title: "Cartão digital | Odonto Anjos — Cosmos e Santa Cruz",
        description: "Cartão digital da Odonto Anjos: unidades de Cosmos e Santa Cruz, rotas, WhatsApp, tratamentos e Instagram."
      },
      privacy: {
        title: "Política de Privacidade | Odonto Anjos",
        description: "Como o site da Odonto Anjos trata dados pessoais."
      }
    }
  },

  /* ---------- NAVEGAÇÃO ---------- */
  nav: [
    { href: "#inicio", label: "Início" },
    { href: "#sobre", label: "Sobre" },
    { href: "#tratamentos", label: "Tratamentos" },
    { href: "#estrutura", label: "Estrutura" },
    { href: "#unidades", label: "Unidades" }
  ],

  /* ---------- TEXTOS ---------- */
  content: {
    hero: {
      eyebrow: "Clínica odontológica",
      titleA: "Um sorriso",
      titleB: "transforma",
      titleC: "tudo.",
      subtitle: "Cuidar do seu sorriso ficou mais fácil.",
      lead: "Encontre a unidade mais perto de você e agende sua avaliação pelo WhatsApp.",
      ctaPrimary: "Encontrar minha unidade",
      ctaSecondary: "Ver tratamentos",
      headerCta: "Agendar avaliação"
    },
    about: {
      eyebrow: "Sobre a Odonto Anjos",
      title: "Cuidado que começa pela confiança.",
      lead: "Antes de qualquer tratamento, a gente escuta você e explica cada etapa com calma.",
      points: [
        { icon: "heart", text: "Atendimento humanizado" },
        { icon: "chat", text: "Explicações claras" },
        { icon: "shield", text: "Foco em prevenção" }
      ]
    },
    treatments: {
      eyebrow: "Tratamentos",
      title: "O cuidado que seu sorriso precisa.",
      lead: "Da prevenção à estética. Escolha um tratamento e tire suas dúvidas antes de agendar.",
      featureEyebrow: "Ortodontia",
      featureTitle: "Atenção a cada etapa do seu sorriso.",
      featureText: "O tipo de aparelho é definido na avaliação, e você é acompanhado em consultas de manutenção.",
      featureCta: "Quero saber sobre aparelhos",
      note: "A indicação de cada tratamento depende de avaliação profissional. Disponibilidade por unidade a confirmar no agendamento."
    },
    structure: {
      eyebrow: "Nossa estrutura",
      title: "Conheça nosso espaço.",
      lead: "Ambientes claros e organizados, preparados para receber você."
    },
    professional: {
      eyebrow: "Conheça nossa profissional",
      name: "Dra. Cíntia dos Anjos",
      role: "Cirurgiã-dentista",
      text: "À frente da Odonto Anjos, a Dra. Cíntia acompanha cada paciente de perto, da avaliação ao retorno.",
      cro: "",               // preencher com o CRO-RJ confirmado para exibir
      qualifications: "",   // preencher com qualificações verificadas para exibir
      cta: "Agendar com a Dra. Cíntia"
    },
    instagram: {
      eyebrow: "Instagram",
      title: "Acompanhe a Odonto Anjos.",
      lead: "Conteúdos, novidades e um pouco da rotina da clínica.",
      cta: "Seguir no Instagram",
      tilesLabel: "Fotos da clínica"
    },
    faq: {
      eyebrow: "Perguntas frequentes",
      title: "Dúvidas antes de agendar?",
      items: [
        { q: "Como agendo uma avaliação?", a: "Escolha a unidade na seção Agende sua avaliação. O site abre o WhatsApp com a mensagem pronta." },
        { q: "Onde ficam as unidades?", a: "Em Cosmos e em Santa Cruz, na Zona Oeste do Rio. Endereços e rotas estão no fim da página." },
        { q: "As duas unidades oferecem os mesmos tratamentos?", a: "Ainda estamos confirmando. Ao agendar, pergunte se o tratamento é feito na unidade escolhida." },
        { q: "A clínica aceita planos odontológicos?", a: "Sim. Pergunte no agendamento se o seu plano é aceito." },
        { q: "Quais são as formas de pagamento?", a: "Há preços populares e facilidade de pagamento. As condições são informadas pela equipe." },
        { q: "Qual é o horário de atendimento?", a: "Santa Cruz: segunda a sexta, das 9h às 18h, e sábado, das 9h às 12h. Cosmos: confirme pelo WhatsApp." }
      ]
    },
    booking: {
      eyebrow: "Agende sua avaliação",
      title: "Vamos cuidar do seu sorriso?",
      lead: "Escolha uma unidade e fale com a gente pelo WhatsApp.",
      unitLabel: "Unidade",
      treatmentLabel: "Tratamento (opcional)",
      treatmentNone: "Avaliação geral",
      submit: "Agendar pelo WhatsApp",
      missing: "O WhatsApp da unidade {unidade} ainda não foi cadastrado. Fale com a clínica pelo Instagram {instagram}."
    },
    units: {
      eyebrow: "Nossas unidades",
      title: "Onde você prefere ser atendido?",
      lead: "Escolha a unidade e veja como chegar."
    }
  },

  footer: {
    tagline: "Clínica odontológica na Zona Oeste do Rio.",
    disclaimer: "As informações deste site não substituem a consulta com o cirurgião-dentista."
  }
};
root.SITE_CONFIG = SITE_CONFIG;
if (typeof module !== "undefined" && module.exports) module.exports = SITE_CONFIG;
})(typeof window !== "undefined" ? window : globalThis);
