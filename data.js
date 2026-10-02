/* Dados da proposta. CONFIRMAR COM A LOJA ANTES DA PUBLICAÇÃO FINAL.
 * As quatro imagens são referências visuais; available:null não indica estoque.
 * A retirada da faixa de proposta não autoriza publicação ou indexação.
 */
window.MAJU_STORE_DATA = {
  proposal: true,
  business: {
    name: 'Maju Store Moda & Acessórios',
    positioning: 'Moda Feminina e Masculina',
    // ENDEREÇO CONFIRMADO pelo cliente: Av. Cônego Ramiro Leite, 475, Centro, Januária-MG.
    address: {street:'Av. Cônego Ramiro Leite',number:'475',district:'Centro',city:'Januária',state:'MG',postalCode:'39480-000',confirmed:true},
    whatsapp: {number:'5538999003567',display:'(38) 99900-3567',confirmed:false,message:'Olá! Vi o site da Maju Store e gostaria de saber mais.'},
    instagram: {
      username:'majustorefs',url:'https://instagram.com/majustorefs',
      profileName:'Maju Store • Moda Feminina e Masculina',confirmed:true,
      // Rounded animation target, not a live/exact count.
      followersCount:53000,followersLabel:'+53 mil',followersAccessibleLabel:'Mais de 53 mil seguidores no Instagram.',followersHeadline:'Mais de 53 mil pessoas acompanham a Maju.',followersSource:'Informação aproximada fornecida pelo cliente',
      followersReferenceDate:'2026-10-01',officialSource:'Perfil oficial indicado pelo cliente',
      highlights:['Moda masculina','Vendas Online','Quem Usa','Novidades','Provadores','História Loja','Envios BR']
    }
  },
  // Foto, nome e telefone de Sheila e Duda exigem autorização comercial para publicação definitiva.
  // A proposta local pode mostrá-los; proposal:false bloqueia links sem publicUseAuthorized:true.
  sellers: [
    // CONFIRMAR AUTORIZAÇÃO PARA PUBLICAÇÃO DO NÚMERO.
    {id:'sheila',name:'Sheila',role:'Atendimento',photo:'assets/team/sheila.webp',number:'5538999835902',display:'(38) 99983-5902',message:'Olá, Sheila! Vi o site da Maju Store e gostaria de saber mais.',publicUseAuthorized:false,numberFormatConfirmed:true},
    // CONFIRMAR AUTORIZAÇÃO PARA PUBLICAÇÃO DO NÚMERO.
    {id:'duda',name:'Duda',role:'Atendimento',photo:'assets/team/duda.webp',number:'5538997446734',display:'(38) 99744-6734',message:'Olá, Duda! Vi o site da Maju Store e gostaria de saber mais.',publicUseAuthorized:false,numberFormatConfirmed:true}
  ],
  products: [
    {id:'shirt',name:'Camisa em tom marfim',category:'Forma leve',image:'assets/shirt.webp',description:'Um tom claro e linhas leves como ponto de partida para imaginar combinações. Esta imagem é uma referência visual demonstrativa.',available:null,demonstrative:true,tone:'cream'},
    {id:'dress',name:'Vestido em terracota',category:'Movimento livre',image:'assets/dress.webp',description:'Uma cor quente e uma silhueta fluida para explorar combinações. Esta imagem é uma referência visual demonstrativa.',available:null,demonstrative:true,tone:'rose'},
    {id:'blazer',name:'Blazer em grafite',category:'Presença sutil',image:'assets/blazer.webp',description:'Linhas definidas e um tom profundo como inspiração para sobrepor peças. Esta imagem é uma referência visual demonstrativa.',available:null,demonstrative:true,tone:'sand'},
    {id:'trousers',name:'Calça em tom areia',category:'Proporções amplas',image:'assets/trousers.webp',description:'Proporções amplas e uma cor natural para pensar diferentes formas de vestir. Esta imagem é uma referência visual demonstrativa.',available:null,demonstrative:true,tone:'cream'}
  ]
};
