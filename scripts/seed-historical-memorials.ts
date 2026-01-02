import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

interface HistoricalMemorial {
  slug: string;
  fullName: string;
  birthDate: string;
  deathDate: string;
  birthplace: string;
  filiation: string;
  biography: string;
  mainPhoto: string | null;
  visibility: "public" | "private";
  status: "active" | "pending_data" | "inactive";
  isHistorical: boolean;
  category: string;
  graveLocation: string;
}

const historicalMemorials: HistoricalMemorial[] = [
  {
    slug: "joaquim-nabuco",
    fullName: "Joaquim Aurélio Barreto Nabuco de Araújo",
    birthDate: "1849-08-19",
    deathDate: "1910-01-17",
    birthplace: "Recife, Pernambuco",
    filiation: "Filho de José Tomás Nabuco de Araújo Filho e Ana Benigna de Sá Barreto Nabuco de Araújo",
    biography: `Joaquim Nabuco foi um dos mais importantes políticos, diplomatas, historiadores e juristas brasileiros do século XIX. Nascido no Recife em 19 de agosto de 1849, foi o principal líder do movimento abolicionista brasileiro, sendo responsável em grande parte pela abolição da escravidão no Brasil em 1888.

Sua infância no Engenho Massangana, sob os cuidados de sua madrinha Ana Rosa Falcão de Carvalho, moldou profundamente sua visão sobre a escravidão. O contato com os escravos do engenho despertou nele uma consciência humanitária que o acompanharia por toda a vida.

Formou-se em Direito pela Faculdade de Direito do Recife em 1870, tendo como colegas os futuros presidentes Rodrigues Alves e Afonso Pena, além do poeta Castro Alves e do jurista Ruy Barbosa. Manteve uma longa amizade com Machado de Assis, com quem trocava correspondências.

Como deputado, liderou a bancada abolicionista na Câmara dos Deputados e fundou a Sociedade Antiescravidão Brasileira. Sua obra 'O Abolicionismo' (1883) tornou-se referência fundamental do movimento. Foi um dos fundadores da Academia Brasileira de Letras.

Na carreira diplomática, serviu como embaixador do Brasil nos Estados Unidos (1905-1910), onde recebeu o título de Doutor Honoris Causa em Letras pela Universidade Yale em 1908. Presidiu a III Conferência Pan-americana no Rio de Janeiro em 1906.

Casou-se em 1889 com Evelina Torres Soares Ribeiro, com quem teve cinco filhos: Maurício (diplomata), Joaquim (sacerdote), Carolina (escritora), Mariana e José Tomás.

Faleceu em Washington, D.C., em 17 de janeiro de 1910, aos 60 anos, vítima de Policitemia vera. Seu corpo foi trasladado para o Brasil e sepultado no Cemitério de Santo Amaro, em Recife, sua cidade natal. Em sua homenagem, o dia 19 de agosto é celebrado como o Dia Nacional do Historiador.

"O verdadeiro patriotismo é o que concilia a pátria com a humanidade." - Joaquim Nabuco`,
    mainPhoto: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663098186173/NIgcNYsiygzhPiOX.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Patrimônio Histórico",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "agamenon-sergio-de-godoy-magalhaes",
    fullName: "Agamenon Sérgio de Godoy Magalhães",
    birthDate: "1893-11-05",
    deathDate: "1952-08-24",
    birthplace: "Serra Talhada, PE",
    filiation: "Filho de Sérgio Nunes Magalhães e Antônia de Godoy Magalhães",
    biography: `Agamenon Sérgio de Godoy Magalhães nasceu em Serra Talhada, Pernambuco, em 5 de novembro de 1893, filho de Sérgio Nunes Magalhães e Antônia de Godoy Magalhães. Vindo de uma família com tradição na política, formou-se em Direito pela Faculdade de Direito do Recife em 1916. Iniciou sua carreira profissional como promotor público na comarca de São Lourenço da Mata. Em 1918, foi eleito deputado estadual, iniciando sua longa e influente trajetória na política pernambucana e nacional.

Sua carreira política foi marcada pela aliança com Getúlio Vargas, a quem apoiou na Revolução de 1930. Durante a Era Vargas, ocupou cargos de grande relevância, como Ministro do Trabalho, Indústria e Comércio e, posteriormente, Ministro da Justiça. Em 1937, com a instauração do Estado Novo, foi nomeado interventor federal em Pernambuco, cargo que ocupou até 1945. Seu governo, conhecido como "Agamenonismo", foi caracterizado por um estilo centralizador e populista, com forte apelo social e repressão aos opositores.

Após a redemocratização, Agamenon Magalhães foi eleito deputado federal constituinte em 1946 e, em 1950, retornou ao governo de Pernambuco, desta vez eleito pelo voto popular. Seu segundo governo foi interrompido por sua morte súbita, em 24 de agosto de 1952. Seu legado é complexo, sendo lembrado tanto por suas políticas sociais e de modernização, como o combate aos mocambos, quanto por seu autoritarismo. Sua influência na política pernambucana perdurou por décadas, consolidando uma das mais importantes forças políticas do estado.

"Em política, o feio é perder." - Agamenon Sérgio de Godoy Magalhães`,
    mainPhoto: "/images/historical/agamenon-magalhaes.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Político",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "manuel-antonio-pereira-borba",
    fullName: "Manuel Antônio Pereira Borba",
    birthDate: "1864-03-19",
    deathDate: "1928-08-11",
    birthplace: "Timbaúba, PE",
    filiation: "Filho de Simão Velho Pereira Borba e Inês Maria de Andrade Lima",
    biography: `Manuel Antônio Pereira Borba nasceu no engenho de Paquivira, em Timbaúba, Pernambuco, em 19 de março de 1864. Filho de Simão Velho Pereira Borba e Inês Maria de Andrade Lima, sua família tinha conexões com a Revolução Republicana de 1817. Iniciou seus estudos em Pilar, na Paraíba, e depois se mudou para o Recife, onde cursou humanidades e se formou em ciências jurídicas e sociais pela Faculdade de Direito do Recife em 1887. Durante seu tempo na faculdade, participou ativamente das campanhas abolicionistas e republicanas, seguindo os ideais políticos de seu pai.

Sua carreira política começou como promotor em Timbaúba e no Recife. Foi eleito deputado estadual em 1891, mas renunciou ao mandato em 1893, afastando-se da política por 18 anos para se dedicar à indústria e à agricultura. Retornou à vida pública em 1911, sendo eleito deputado federal em 1912 e, posteriormente, governador de Pernambuco, cargo que exerceu de 1915 a 1919. Seu governo foi marcado por importantes realizações, como a criação da Imprensa Oficial, a construção de estradas e pontes, a reforma do sistema penitenciário e a implementação de políticas de higienização que controlaram doenças endêmicas. Também se preocupou com a educação, obrigando as indústrias a manterem escolas para os filhos de seus funcionários.

Após o governo de Pernambuco, Manuel Borba foi eleito senador em 1920. No Senado, destacou-se por sua oposição à Lei de Imprensa, que considerava uma afronta à liberdade de pensamento e aos princípios democráticos. Faleceu no Recife, em 11 de agosto de 1928, no Hospital Português, aos 64 anos, devido a complicações de uma cirurgia após engolir um osso de galinha, agravadas por sua condição de diabético. Seu legado é o de um político modernizador, que implementou importantes obras de infraestrutura e reformas sociais em Pernambuco, deixando uma marca duradoura na história do estado.`,
    mainPhoto: "/images/historical/manuel-borba.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Político",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "miguel-arraes-de-alencar",
    fullName: "Miguel Arraes de Alencar",
    birthDate: "1916-12-15",
    deathDate: "2005-08-13",
    birthplace: "Araripe, CE",
    filiation: "Filho de José Almino de Alencar e Silva e Maria Benigna Arraes",
    biography: `Miguel Arraes de Alencar nasceu em Araripe, Ceará, em 15 de dezembro de 1916, filho de José Almino de Alencar e Silva e Maria Benigna Arraes. Mudou-se para o Recife ainda jovem, onde se formou em Direito pela Faculdade de Direito do Recife em 1937. Iniciou sua carreira no serviço público como funcionário do Instituto do Açúcar e do Álcool (IAA), onde se destacou por sua competência e dedicação.

Sua trajetória política começou em 1948, quando foi eleito deputado estadual pelo Partido Social Democrático (PSD). Em 1950, foi nomeado secretário da Fazenda de Pernambuco, cargo que ocupou até 1958. Em 1959, foi eleito prefeito do Recife, e em 1962, governador de Pernambuco, com uma plataforma de reformas sociais e apoio aos trabalhadores rurais. Seu governo foi marcado por iniciativas pioneiras de alfabetização, utilizando o método Paulo Freire, e pela defesa dos direitos dos trabalhadores do campo.

O golpe militar de 1964 interrompeu seu mandato. Arraes foi preso e, posteriormente, exilado na Argélia, onde permaneceu até 1979. Ao retornar ao Brasil, retomou sua carreira política, sendo eleito deputado federal em 1982 e governador de Pernambuco por mais duas vezes, em 1986 e 1994. Seu legado é o de um político comprometido com as causas populares e a justiça social, sendo uma das figuras mais importantes da história política de Pernambuco.

Miguel Arraes faleceu em 13 de agosto de 2005, no Recife, aos 88 anos. Foi sepultado no Cemitério de Santo Amaro, onde seu túmulo é visitado por admiradores e correligionários. Em 2016, foi reconhecido como Herói da Pátria pelo Congresso Nacional.

"A política é a arte de servir ao povo." - Miguel Arraes de Alencar`,
    mainPhoto: "/images/historical/miguel-arraes.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Político",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "eduardo-henrique-accioly-campos",
    fullName: "Eduardo Henrique Accioly Campos",
    birthDate: "1965-08-10",
    deathDate: "2014-08-13",
    birthplace: "Recife, PE",
    filiation: "Filho de Maximiano Accioly Campos e Ana Lúcia Arraes de Alencar",
    biography: `Eduardo Henrique Accioly Campos (Recife, 10 de agosto de 1965 – Santos, 13 de agosto de 2014) foi um economista e político brasileiro. Neto de Miguel Arraes, uma importante figura política em Pernambuco, Campos iniciou sua carreira política cedo, influenciado pela trajetória de seu avô. Formou-se em Economia pela Universidade Federal de Pernambuco (UFPE) e rapidamente ingressou na vida pública, onde se destacou pela sua capacidade de articulação e gestão.

Sua carreira política foi marcada por uma rápida ascensão. Foi deputado estadual, deputado federal e ministro da Ciência e Tecnologia durante o governo de Luiz Inácio Lula da Silva. Como governador de Pernambuco por dois mandatos consecutivos (2007-2014), implementou programas de grande impacto, como o 'Pacto pela Vida', que visava a redução da criminalidade, e promoveu o desenvolvimento econômico do estado, com a atração de investimentos e a criação de novos polos industriais. Sua gestão foi amplamente reconhecida e aprovada pela população, o que o projetou nacionalmente.

Em 2014, lançou-se como candidato à Presidência da República pelo Partido Socialista Brasileiro (PSB), buscando apresentar uma alternativa à polarização política tradicional. Sua campanha, no entanto, foi tragicamente interrompida por um acidente aéreo em Santos, São Paulo, que resultou em sua morte e na de sua equipe. Seu legado é lembrado pela modernização da gestão pública em Pernambuco e pela sua tentativa de construir uma 'terceira via' na política brasileira, sendo postumamente nomeado 'Herói da Pátria'.

"Não vamos desistir do Brasil. É aqui onde nós vamos criar nossos filhos, é aqui onde nós temos que criar uma sociedade mais justa." - Eduardo Henrique Accioly Campos`,
    mainPhoto: "/images/historical/eduardo-campos.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Político",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "francisco-de-assis-franca",
    fullName: "Francisco de Assis França",
    birthDate: "1966-03-13",
    deathDate: "1997-02-02",
    birthplace: "Olinda, PE",
    filiation: "",
    biography: `Francisco de Assis França, mais conhecido como Chico Science, foi um cantor e compositor brasileiro, nascido em Olinda, Pernambuco, em 13 de março de 1966. Desde cedo, envolveu-se com grupos de dança e hip hop, mas foi no início da década de 1990 que sua carreira tomou um rumo decisivo. Ao lado da banda Nação Zumbi, Chico Science foi um dos idealizadores do movimento manguebeat, que misturava ritmos regionais, como o maracatu, com rock, hip hop, funk e música eletrônica.

O lançamento do álbum "Da Lama ao Caos", em 1994, marcou a estreia de Chico Science & Nação Zumbi e é considerado um marco na música brasileira. O disco trouxe uma sonoridade inovadora e letras que retratavam o cotidiano e as questões sociais do Recife. O sucesso do álbum projetou o manguebeat para todo o país e também para o exterior, com turnês pela Europa e Estados Unidos. Em 1996, a banda lançou seu segundo álbum, "Afrociberdelia", que consolidou o sucesso e a importância do movimento.

A carreira de Chico Science foi tragicamente interrompida em 2 de fevereiro de 1997, aos 30 anos, em um acidente de carro no Recife. Sua morte prematura deixou um vazio na música brasileira, mas seu legado continua vivo e influente. Chico Science é lembrado como um artista visionário, que revolucionou a música brasileira ao criar uma ponte entre a tradição e a modernidade, e que deu voz a uma geração de jovens da periferia do Recife.

"Um passo à frente e você não está mais no mesmo lugar." - Francisco de Assis França`,
    mainPhoto: "/images/historical/chico-science.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "juvenal-de-holanda-vasconcelos",
    fullName: "Juvenal de Holanda Vasconcelos",
    birthDate: "1944-08-02",
    deathDate: "2016-03-09",
    birthplace: "Recife, PE",
    filiation: "",
    biography: `Juvenal de Holanda Vasconcelos, mundialmente conhecido como Naná Vasconcelos, foi um virtuoso percussionista, vocalista e mestre do berimbau, nascido em Recife, Pernambuco, em 2 de agosto de 1944. Desde cedo, demonstrou um talento musical extraordinário, iniciando sua carreira profissional aos 12 anos de idade, incentivado por seu pai, que também era músico. Sua genialidade o levou a explorar uma vasta gama de instrumentos de percussão, tornando-se uma figura central na fusão de ritmos brasileiros com o jazz e a world music, o que o consagrou como um dos músicos mais inovadores e respeitados de sua geração.

A carreira de Naná Vasconcelos foi marcada por colaborações com alguns dos maiores nomes da música mundial. Na década de 1970, mudou-se para o Rio de Janeiro e, posteriormente, para a Europa e Estados Unidos, onde trabalhou com artistas como Pat Metheny, Don Cherry, Jan Garbarek, Egberto Gismonti e Milton Nascimento. Formou o aclamado grupo Codona, com Don Cherry e Collin Walcott, que lançou três álbuns de grande sucesso. Ao longo de sua trajetória, Naná foi agraciado com oito prêmios Grammy e foi eleito o melhor percussionista do mundo por sete anos consecutivos pela prestigiosa revista de jazz Down Beat, um feito que atesta sua maestria e influência no cenário musical internacional.

O legado de Naná Vasconcelos transcende suas inúmeras gravações e prêmios. Ele foi um embaixador da cultura brasileira, levando os sons do seu país para os quatro cantos do planeta. Sua abordagem única da percussão, que combinava técnica apurada com uma profunda sensibilidade artística, abriu novos caminhos para o uso de instrumentos tradicionais brasileiros na música contemporânea. Naná faleceu em 9 de março de 2016, em sua cidade natal, Recife, vítima de um câncer de pulmão, deixando uma lacuna insubstituível na música brasileira e mundial. Sua obra continua a inspirar músicos e amantes da música em todo o mundo, e seu nome permanece como sinônimo de genialidade, inovação e paixão pela arte.

"Música e imagem é a mesma coisa" - Juvenal de Holanda Vasconcelos`,
    mainPhoto: "/images/historical/nana-vasconcelos.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "lourenco-da-fonseca-barbosa",
    fullName: "Lourenço da Fonseca Barbosa",
    birthDate: "1904-10-28",
    deathDate: "1997-12-31",
    birthplace: "Surubim, PE",
    filiation: "Filho de Severino Atanásio de Souza Barbosa e Maria Digna da Fonseca Barbosa",
    biography: `Capiba, nome artístico de Lourenço da Fonseca Barbosa, nasceu em Surubim, Pernambuco, em 28 de outubro de 1904. Vindo de uma família de músicos, seu pai, Severino Atanásio de Souza Barbosa, era maestro da banda municipal. Iniciou seus estudos musicais ainda criança, tocando trompa aos oito anos. Pouco depois, mudou-se com a família para a Paraíba, onde trabalhou como pianista em cinemas. Apesar de uma breve passagem pelo futebol, atuando como zagueiro do Campinense Clube, sua vocação musical falou mais alto, e aos 20 anos gravou seu primeiro disco com a valsa "Meu Destino".

Aos 26 anos, Capiba mudou-se para o Recife, onde sua carreira se consolidou. Ingressou no Banco do Brasil por meio de concurso público, o que lhe garantiu estabilidade financeira para se dedicar à música. Em 1934, firmou-se como um grande compositor de carnaval ao vencer um concurso com o frevo-canção "É de amargar". Torcedor apaixonado pelo Santa Cruz Futebol Clube, compôs o hino do time, "O Mais Querido", em 1948. Sua obra diversificada inclui mais de 200 canções, abrangendo frevos, sambas, valsas e até música erudita, musicando poemas de grandes nomes como Carlos Drummond de Andrade e Vinicius de Moraes.

Capiba faleceu no Recife em 31 de dezembro de 1997, aos 93 anos, vítima de uma infecção generalizada. Seu corpo foi sepultado no Cemitério de Santo Amaro, no Recife. Considerado o mais conhecido compositor de frevos do Brasil, seu legado é fundamental para a cultura pernambucana e brasileira. Deixou uma vasta obra, com centenas de composições gravadas e inéditas, que continuam a animar os carnavais e a encantar gerações. Sua importância é celebrada com uma estátua em sua homenagem no Recife, e sua casa foi desapropriada para se tornar patrimônio cultural de Pernambuco.

"Somos madeira de lei que cupim não rói!" - Lourenço da Fonseca Barbosa`,
    mainPhoto: "/images/historical/capiba.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "abelardo-germano-da-hora",
    fullName: "Abelardo Germano da Hora",
    birthDate: "1924-07-31",
    deathDate: "2014-09-23",
    birthplace: "São Lourenço da Mata, PE",
    filiation: "Filho de José Germano da Hora e Severina Maria Germano da Hora",
    biography: `Abelardo Germano da Hora, nascido em São Lourenço da Mata, Pernambuco, em 31 de julho de 1924, foi um renomado artista plástico brasileiro, destacando-se como escultor, desenhista, gravurista, pintor, ceramista, professor e poeta. Filho de José Germano da Hora e Severina Maria Germano da Hora, mudou-se com a família para o Recife em 1928. Em 1939, ingressou na Escola de Belas Artes do Recife, onde estudou diversas técnicas artísticas e se tornou uma figura proeminente, presidindo o Diretório Estudantil e incentivando a arte ao ar livre e o retrato da vida cotidiana.

Sua carreira deslanchou a partir da década de 1940, quando seu talento foi reconhecido pelo industrial Ricardo Brennand, para quem trabalhou realizando projetos com temáticas regionais. Em 1948, fundou a Sociedade de Arte Moderna do Recife (SAMR), um marco na cena cultural pernambucana. Nos anos seguintes, liderou o Ateliê Coletivo, rompendo com o ensino acadêmico tradicional e formando uma nova geração de artistas. Sua obra é marcada pela denúncia das injustiças sociais, como na série de desenhos "Meninos do Recife", e pela criação de esculturas e monumentos que se tornaram parte da paisagem urbana do Recife, incluindo a primeira escultura de arte cinética do Brasil.

Além de sua vasta produção artística, Abelardo da Hora teve uma intensa participação política, sendo membro do Partido Comunista Brasileiro (PCB) e um dos fundadores do Movimento de Cultura Popular. Foi preso durante o golpe militar de 1964, o que o levou a se exilar em São Paulo por um período. Ao longo de sua vida, recebeu inúmeras homenagens e condecorações, como a Ordem do Mérito Cultural e a Ordem do Rio Branco. Seu legado perdura em suas obras espalhadas por espaços públicos e privados, e no Instituto Abelardo da Hora, que preserva e divulga sua memória. Faleceu no Recife, em 23 de setembro de 2014, aos 90 anos, deixando uma marca indelével na arte e na cultura brasileira.

"Nenhum ser humano nasce igual a outro. Cada ser que nasce é uma aventura biológica, um risco que a vida assume, um PIONEIRO." - Abelardo Germano da Hora`,
    mainPhoto: "/images/historical/abelardo-da-hora.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "anayde-da-costa-beiriz",
    fullName: "Anayde da Costa Beiriz",
    birthDate: "1905-02-18",
    deathDate: "1930-10-22",
    birthplace: "Parahyba do Norte, Paraíba",
    filiation: "Filha de José da Costa Beiriz e Maria Augusta de Azevedo Beiriz",
    biography: `Anaíde Beiriz foi uma professora e poetisa brasileira que viveu no início do século XX. Nascida na Paraíba, destacou-se por suas ideias vanguardistas e por desafiar as convenções sociais de sua época. Formou-se professora aos 17 anos e lecionou para pescadores em Cabedelo, demonstrando um forte compromisso com a educação popular.

Além de seu trabalho como educadora, Anaíde era uma figura ativa no cenário intelectual da Paraíba. Participava de saraus literários, escrevia poesias e defendia a participação feminina na política, em um período em que as mulheres ainda não tinham direito ao voto. Seu estilo de vida, incluindo o cabelo curto e as roupas ousadas, chocava a sociedade conservadora da época, mas também a tornava um ícone de liberdade e modernidade.

A vida de Anaíde foi tragicamente interrompida aos 25 anos. Seu relacionamento com o político João Dantas, opositor do governo de João Pessoa, levou à exposição de suas cartas de amor, causando um grande escândalo. Após o assassinato de João Pessoa por João Dantas, e a subsequente morte de Dantas na prisão, Anaíde, desolada e publicamente humilhada, cometeu suicídio. Seu legado, no entanto, perdura como um símbolo de resistência e da luta pela emancipação feminina no Brasil.

"Quando não escrevo, meu universo se reduz, sinto-me na prisão. Perco minha chama, minhas cores." - Anayde da Costa Beiriz`,
    mainPhoto: "/images/historical/anayde-beiriz.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, Pernambuco"
  },
  {
    slug: "menina-sem-nome",
    fullName: "Menina Sem Nome",
    birthDate: "1960-01-01",
    deathDate: "1970-06-23",
    birthplace: "Pernambuco, Brasil",
    filiation: "",
    biography: `A história da "Menina Sem Nome" é um dos casos mais comoventes e misteriosos de Recife. Em 23 de junho de 1970, o corpo de uma menina, com idade estimada entre 8 e 10 anos, foi encontrado na Praia do Pina. A criança, que vestia apenas uma calça curta de adulto, estava com as mãos e o pescoço amarrados e apresentava marcas de facadas, indicando um assassinato brutal. O corpo permaneceu no Instituto de Medicina Legal (IML) por onze dias, mas ninguém apareceu para reclamá-lo, e sua identidade nunca foi descoberta.

Diante da falta de identificação, o diretor da Casa do Menor do Recife, José Antônio Braga, com autorização da Secretaria de Segurança Pública, organizou o sepultamento da menina. Em 3 de julho de 1970, ela foi enterrada como indigente no Cemitério de Santo Amaro, em uma cerimônia que atraiu cerca de mil pessoas, comovidas com a trágica história amplamente divulgada pela imprensa local. O caso teve grande repercussão, e um suspeito, Geraldo Magno de Oliveira, conhecido como "Monstro do Pina", foi preso, confessou o crime sob alegação de tortura e, posteriormente, foi condenado, embora a verdade sobre sua culpa permaneça incerta para alguns.

Com o passar do tempo, o túmulo da "Menina Sem Nome" transformou-se em um local de peregrinação. Relatos de graças alcançadas e milagres atribuídos a ela começaram a se espalhar, consolidando sua figura como uma santa popular. Hoje, seu túmulo é um dos mais visitados do cemitério, recebendo diariamente flores, brinquedos, doces e placas de agradecimento de devotos que mantêm viva a sua memória e a consideram uma intercessora divina. A devoção popular transcendeu o crime, transformando a vítima anônima em um poderoso símbolo de fé e esperança para muitos recifenses.`,
    mainPhoto: "/images/historical/menina-sem-nome.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Devoção Popular",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "alfredo-sotero-neto",
    fullName: "Alfredo Sotero Neto",
    birthDate: "1947-01-01",
    deathDate: "1959-02-01",
    birthplace: "Recife, PE",
    filiation: "",
    biography: `Alfredo Sotero Neto, conhecido popularmente como Alfredinho, foi uma criança da classe média de Pernambuco que se tornou uma figura de grande devoção popular no Recife. Sua história é marcada por uma trágica morte prematura e pela fé que sua imagem despertou em muitas pessoas. Alfredinho faleceu em fevereiro de 1959, aos 12 anos, vítima de uma doença com sintomas semelhantes à leucemia, em uma época em que o tratamento para tal enfermidade era escasso e difícil. Seu sofrimento e a forma como enfrentou a doença foram vistos por muitos como um martírio, o que levou à sua associação com a santidade no imaginário popular.

Após sua morte, o túmulo de Alfredinho no Cemitério de Santo Amaro, em Recife, tornou-se um local de peregrinação. Fiéis de diversas partes da cidade e do estado procuravam o local para pedir graças, pagar promessas e acender velas em sua homenagem. A crença nos poderes milagrosos de Alfredinho se espalhou rapidamente, e diversos relatos de curas e outras graças alcançadas por sua intercessão foram publicados em jornais da época, como o Diario de Pernambuco e o Diario da Manhã. Essas publicações ajudaram a consolidar a imagem de Alfredinho como um "santo popular", uma figura sagrada não canonizada pela Igreja Católica, mas legitimada pela fé do povo.

Com o passar do tempo, a devoção a Alfredinho foi diminuindo. O surgimento de outras figuras de devoção popular, como a "Menina Sem Nome", também sepultada no Cemitério de Santo Amaro, contribuiu para que a história de Alfredinho fosse sendo gradualmente esquecida. Apesar disso, seu túmulo ainda recebe visitas de alguns devotos que mantêm viva a memória do "menino milagreiro". A história de Alfredinho é um exemplo marcante da religiosidade popular brasileira e da forma como a fé se manifesta e se transforma ao longo do tempo, criando e recriando seus próprios santos e símbolos de esperança.`,
    mainPhoto: null,
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Devoção Popular",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "francisco-do-rego-barros",
    fullName: "Francisco do Rego Barros",
    birthDate: "1802-02-04",
    deathDate: "1870-10-04",
    birthplace: "Cabo de Santo Agostinho, PE",
    filiation: "Filho de Francisco do Rego Barros e Mariana Francisca de Paula Cavalcanti de Albuquerque",
    biography: `Francisco do Rego Barros, o Conde da Boa Vista, nasceu no Engenho Trapiche, em Cabo de Santo Agostinho, Pernambuco, em 4 de fevereiro de 1802. Filho do coronel de milícias Francisco do Rego Barros e de Mariana Francisca de Paula Cavalcanti de Albuquerque, demonstrou interesse pela carreira militar desde cedo, alistando-se no Regimento de Artilharia do Recife aos quinze anos. Em 1821, participou da Revolução de Goiana, sendo preso e enviado para Lisboa, Portugal. Após sua libertação em 1823, mudou-se para Paris, onde se bacharelou em Matemática pela Universidade de Paris, um feito que destacava sua formação intelectual e o preparava para os grandes desafios que assumiria no Brasil.

Ao retornar a Pernambuco, Rego Barros ingressou na política e, em 1837, com apenas 35 anos, foi nomeado presidente da província, cargo que ocupou até 1844. Durante seu governo, promoveu uma profunda modernização urbana no Recife, com o objetivo de higienizar e embelezar a capital. Entre suas realizações mais notáveis estão a construção do Palácio das Princesas, do Teatro de Santa Isabel, do Cemitério de Santo Amaro e da antiga Casa de Detenção, que hoje abriga a Casa da Cultura. Além disso, investiu na construção de pontes, canais, estradas e em um sistema de abastecimento de água potável, transformando a infraestrutura e a paisagem urbana do Recife e consolidando seu legado como um dos maiores administradores da história de Pernambuco.

Além de sua atuação como presidente de província, o Conde da Boa Vista foi deputado geral, senador do Império de 1850 a 1870 e presidente da província do Rio Grande do Sul durante a Guerra do Paraguai. Por seus serviços à nação, recebeu os títulos de barão, visconde e, finalmente, Conde da Boa Vista. Sua administração é lembrada como uma era de grande progresso material e cultural, que inseriu o Recife no circuito das cidades modernas de sua época. Faleceu em 4 de outubro de 1870, em sua residência na Rua da Aurora, no Recife, e foi sepultado no Cemitério de Santo Amaro, uma de suas próprias obras.`,
    mainPhoto: "/images/historical/conde-boa-vista.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Nobreza Imperial",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "francisco-antonio-de-oliveira",
    fullName: "Francisco Antônio de Oliveira",
    birthDate: "1788-09-21",
    deathDate: "1855-09-24",
    birthplace: "Recife, PE",
    filiation: "Filho de Francisco de Oliveira Guimarães e de Maria Joaquina da Conceição e Oliveira",
    biography: `Francisco Antônio de Oliveira, primeiro e único Barão de Beberibe, foi um comerciante e empreendedor brasileiro. Nascido em Recife, em 21 de setembro de 1788, tornou-se uma das figuras mais influentes de Pernambuco na primeira metade do século XIX. Sua atuação como um dos maiores traficantes de escravos do Brasil, com operações que se estendiam à África e a Portugal, foi um dos pilares de sua fortuna e poder. Em paralelo, manteve uma proeminente carreira política como membro do Partido Conservador, ocupando por vinte anos uma cadeira na Câmara Municipal do Recife, da qual foi presidente por diversas vezes.

A influência do Barão de Beberibe extrapolou a esfera política e comercial, marcando profundamente o desenvolvimento urbano do Recife. Durante o governo de Francisco do Rego Barros, o Conde da Boa Vista, Oliveira financiou e participou de importantes obras de urbanização da capital pernambucana. Entre seus investimentos mais notáveis estão a construção do seu solar no bairro da Boa Vista, demolido em 1942, e o palacete que hoje abriga o Museu do Estado de Pernambuco, um legado que preserva a memória da sociedade recifense do período imperial.

Além de seu envolvimento em obras públicas, o Barão de Beberibe foi uma figura central na criação de diversas instituições que impulsionaram a economia local. Foi um dos fundadores da Associação Comercial de Pernambuco, do Banco Comercial de Pernambuco e da Companhia Pernambucana de Navegação. Seu título de barão foi concedido em 13 de dezembro de 1853, em reconhecimento à sua influência e poder. Faleceu em 24 de setembro de 1855, no Recife, e seu mausoléu encontra-se no Cemitério de Santo Amaro.`,
    mainPhoto: null,
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Nobreza Imperial",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "luiz-marinho-falcao-filho",
    fullName: "Luiz Marinho Falcão Filho",
    birthDate: "1926-05-08",
    deathDate: "2002-02-03",
    birthplace: "Timbaúba, PE",
    filiation: "Filho de Luiz Marinho Falcão e Rosa Bezerril Falcão",
    biography: `Luiz Marinho Falcão Filho, nascido em Timbaúba, Pernambuco, em 8 de maio de 1926, foi um renomado dramaturgo brasileiro. Criado no interior, em uma família de nove irmãos, suas obras refletem as memórias e o universo cultural do Nordeste, com suas crendices, violeiros, vaqueiros e cangaceiros. Aos 17 anos, mudou-se para o Recife, onde iniciou sua aclamada carreira teatral, que o consolidaria como um dos grandes nomes do teatro brasileiro.

Sua trajetória foi marcada por 14 peças teatrais que lhe renderam prêmios importantes, como o Molière, o da Academia Brasileira de Letras e o da Academia Pernambucana de Letras. Sua primeira peça, "Um Sábado em Trinta", obteve grande sucesso nacional, sendo encenada em diversas capitais brasileiras. Outra obra de destaque, "Viva o Cordão Encarnado", garantiu-lhe o prêmio Molière de melhor autor em 1974. Embora reconhecido como um autor regionalista, Luiz Marinho acreditava que sua obra transcendia essa categorização, buscando valorizar a cultura que amava.

Luiz Marinho faleceu no Recife, em 3 de fevereiro de 2002, aos 75 anos, vítima de um câncer na bexiga. Seu corpo foi velado na Academia Pernambucana de Letras e sepultado no Cemitério de Santo Amaro, na mesma cidade. Casado com Zaílde Maria França, deixou quatro filhos e um legado de grande relevância para a dramaturgia brasileira, sendo suas obras estudadas e encenadas até os dias de hoje, perpetuando a riqueza da cultura nordestina.

"Apenas procuro defender e valorizar o que amo. Que viva o teatro maior, de todas as regiões e pátrias." - Luiz Marinho Falcão Filho`,
    mainPhoto: "/images/historical/luiz-marinho.jpg",
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  },
  {
    slug: "jose-de-souza-pimentel",
    fullName: "José de Souza Pimentel",
    birthDate: "1934-08-11",
    deathDate: "2018-08-14",
    birthplace: "Garanhuns, PE",
    filiation: "",
    biography: `José de Souza Pimentel, conhecido artisticamente como José Pimentel, foi um renomado ator, diretor, dramaturgo e professor de teatro brasileiro. Nascido em Garanhuns, Pernambuco, em 11 de agosto de 1934, Pimentel tornou-se um ícone das artes cênicas no estado, com uma carreira que se estendeu por mais de seis décadas. Sua trajetória artística começou em 1956, e desde então, ele se dedicou a diversas áreas do teatro, incluindo atuação, direção, roteiro, iluminação e cenografia. Além de seu trabalho nos palcos, Pimentel também foi professor de teatro na faculdade de jornalismo da Universidade Federal de Pernambuco (UFPE), no Recife, onde contribuiu para a formação de novas gerações de artistas.

A carreira de José Pimentel é indissociável de sua interpretação de Jesus Cristo na Paixão de Cristo. Por mais de 40 anos, ele deu vida ao personagem, primeiro no espetáculo de Nova Jerusalém, onde começou como soldado romano e depois assumiu o papel principal de 1978 a 1996, e posteriormente na Paixão de Cristo do Recife, um espetáculo que ele mesmo idealizou e dirigiu a partir de 1997. Sua interpretação marcante e dedicada o consagrou como o rosto de Jesus para milhares de pernambucanos e turistas, tornando-se uma tradição na Semana Santa da região. Em reconhecimento à sua importância cultural, foi declarado Patrimônio Vivo de Pernambuco em 2017.

O legado de José Pimentel transcende sua atuação como Jesus. Ele esteve envolvido em diversas outras produções teatrais e cinematográficas, como o filme "Faustão" (1971) e a novela "A Moça do Sobrado Grande". Durante a ditadura militar, dirigiu e apresentou o polêmico programa "Sinal Fechado" na TV Universitária. Pimentel faleceu em 14 de agosto de 2018, aos 84 anos, no Recife, em decorrência de um enfisema pulmonar, deixando um vazio na cultura pernambucana, mas também um rico legado de paixão, dedicação e talento para as artes cênicas.`,
    mainPhoto: null,
    visibility: "public",
    status: "active",
    isHistorical: true,
    category: "Artista",
    graveLocation: "Cemitério de Santo Amaro, Recife, PE"
  }
];

async function seedHistoricalMemorials() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Starting historical memorials seed...");

  try {
    const sql = neon(connectionString);
    const db = drizzle(sql);

    for (const memorial of historicalMemorials) {
      console.log(`📝 Inserting: ${memorial.fullName}`);
      
      await sql`
        INSERT INTO memorials (
          slug, full_name, birth_date, death_date, birthplace, filiation, 
          biography, main_photo, visibility, status, is_historical, 
          category, grave_location, "createdAt", "updatedAt"
        ) VALUES (
          ${memorial.slug},
          ${memorial.fullName},
          ${memorial.birthDate},
          ${memorial.deathDate},
          ${memorial.birthplace},
          ${memorial.filiation},
          ${memorial.biography},
          ${memorial.mainPhoto},
          ${memorial.visibility},
          ${memorial.status},
          ${memorial.isHistorical},
          ${memorial.category},
          ${memorial.graveLocation},
          NOW(),
          NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          birth_date = EXCLUDED.birth_date,
          death_date = EXCLUDED.death_date,
          birthplace = EXCLUDED.birthplace,
          filiation = EXCLUDED.filiation,
          biography = EXCLUDED.biography,
          main_photo = EXCLUDED.main_photo,
          visibility = EXCLUDED.visibility,
          status = EXCLUDED.status,
          is_historical = EXCLUDED.is_historical,
          category = EXCLUDED.category,
          grave_location = EXCLUDED.grave_location,
          "updatedAt" = NOW()
      `;
    }

    console.log(`✅ Successfully seeded ${historicalMemorials.length} historical memorials!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedHistoricalMemorials();
