export type TipoContrato =
  | "ALUGUEL_RESIDENCIAL"
  | "ALUGUEL_COMERCIAL"
  | "COMPRA_VENDA"
  | "INTERMEDIACAO"
  | "LOCACAO_TEMPORADA"
  | "PERSONALIZADO";

export interface ContratoTemplate {
  tipo: TipoContrato;
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
  conteudo: string;
}

export const CONTRATOS_TEMPLATES: ContratoTemplate[] = [
  {
    tipo: "ALUGUEL_RESIDENCIAL",
    titulo: "Contrato de Aluguel Residencial",
    descricao: "Locação de imóvel para uso residencial – Lei 8.245/91",
    icone: "🏠",
    cor: "blue",
    conteudo: `<h1 style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 8px;">CONTRATO DE LOCAÇÃO RESIDENCIAL</h1>
<p style="text-align: center; margin-bottom: 24px;"><em>Regido pela Lei nº 8.245/91 (Lei do Inquilinato)</em></p>

<p>Pelo presente instrumento particular de contrato de locação residencial, as partes abaixo identificadas celebram entre si o seguinte contrato, que se regerá pelas cláusulas e condições adiante estipuladas:</p>

<h2>DAS PARTES</h2>
<p><strong>LOCADOR(A):</strong> [NOME COMPLETO DO LOCADOR]<br>
<strong>Nacionalidade:</strong> [NACIONALIDADE] | <strong>Estado Civil:</strong> [ESTADO CIVIL]<br>
<strong>Profissão:</strong> [PROFISSÃO]<br>
<strong>CPF/CNPJ:</strong> [CPF/CNPJ] | <strong>RG:</strong> [RG]<br>
<strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>LOCATÁRIO(A):</strong> [NOME COMPLETO DO LOCATÁRIO]<br>
<strong>Nacionalidade:</strong> [NACIONALIDADE] | <strong>Estado Civil:</strong> [ESTADO CIVIL]<br>
<strong>Profissão:</strong> [PROFISSÃO]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Endereço atual:</strong> [ENDEREÇO ATUAL]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>FIADOR(A) (se houver):</strong> [NOME COMPLETO DO FIADOR]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Endereço:</strong> [ENDEREÇO DO FIADOR]<br>
<strong>Telefone:</strong> [TELEFONE]</p>

<h2>CLÁUSULA 1ª – DO OBJETO</h2>
<p>O presente contrato tem por objeto a locação do imóvel residencial situado à <strong>[ENDEREÇO COMPLETO DO IMÓVEL]</strong>, complemento <strong>[COMPLEMENTO]</strong>, bairro <strong>[BAIRRO]</strong>, cidade de <strong>[CIDADE]</strong> – <strong>[ESTADO]</strong>, CEP <strong>[CEP]</strong>, composto de <strong>[DESCRIÇÃO DO IMÓVEL: ex. 3 quartos, sala, cozinha, 2 banheiros, garagem]</strong>, com área total de <strong>[ÁREA]</strong> m².</p>

<h2>CLÁUSULA 2ª – DA FINALIDADE</h2>
<p>O imóvel objeto deste contrato será utilizado exclusivamente para fins residenciais, sendo expressamente vedado qualquer uso comercial, industrial, de prestação de serviços ou qualquer outra finalidade diversa da ora contratada.</p>

<h2>CLÁUSULA 3ª – DO PRAZO</h2>
<p>O prazo da locação é de <strong>[PRAZO EM MESES] ([PRAZO POR EXTENSO])</strong> meses, com início em <strong>[DATA DE INÍCIO]</strong> e término em <strong>[DATA DE TÉRMINO]</strong>, podendo ser renovado mediante acordo expresso entre as partes. Findo o prazo, caso o LOCATÁRIO permaneça no imóvel por mais de 30 (trinta) dias sem oposição do LOCADOR, o contrato considera-se renovado por prazo indeterminado.</p>

<h2>CLÁUSULA 4ª – DO ALUGUEL E FORMA DE PAGAMENTO</h2>
<p>O aluguel mensal é fixado em <strong>R$ [VALOR] ([VALOR POR EXTENSO])</strong>, a ser pago até o dia <strong>[DIA]</strong> de cada mês, pelos seguintes dados:</p>
<p><strong>Banco:</strong> [BANCO] | <strong>Agência:</strong> [AGÊNCIA] | <strong>Conta:</strong> [CONTA]<br>
<strong>Chave PIX:</strong> [CHAVE PIX]<br>
<strong>Titular:</strong> [NOME DO TITULAR DA CONTA]</p>
<p>O recibo de pagamento será fornecido ao LOCATÁRIO como comprovante de quitação.</p>

<h2>CLÁUSULA 5ª – DO REAJUSTE</h2>
<p>O valor do aluguel será reajustado anualmente, no mês de aniversário do contrato, com base na variação acumulada do <strong>IGP-M</strong> (Índice Geral de Preços – Mercado) da Fundação Getúlio Vargas, ou, em sua ausência, pelo <strong>IPCA</strong> (Índice Nacional de Preços ao Consumidor Amplo) do IBGE.</p>

<h2>CLÁUSULA 6ª – DA GARANTIA LOCATÍCIA</h2>
<p>Como garantia desta locação, o LOCATÁRIO deposita, nesta data, a importância de <strong>R$ [VALOR DO CAUÇÃO] ([VALOR POR EXTENSO])</strong>, equivalente a <strong>[N] ([N POR EXTENSO])</strong> aluguéis, a título de <strong>CAUÇÃO</strong>. Tal valor será restituído ao LOCATÁRIO no prazo de 30 (trinta) dias após o término da locação, desde que o imóvel seja devolvido nas condições originais, deduzidos eventuais débitos ou danos.</p>

<h2>CLÁUSULA 7ª – DAS DESPESAS E ENCARGOS</h2>
<p>Ficam a cargo do LOCATÁRIO todas as despesas decorrentes do uso do imóvel, incluindo:</p>
<ol>
<li>Consumo de energia elétrica, água, gás e demais utilidades;</li>
<li>IPTU (Imposto Predial e Territorial Urbano) – <strong>[LOCADOR / LOCATÁRIO]</strong>;</li>
<li>Taxa de condomínio ordinária – <strong>[LOCADOR / LOCATÁRIO]</strong>;</li>
<li>Taxa de condomínio extraordinária – a cargo do LOCADOR;</li>
<li>Seguro contra incêndio – a cargo do <strong>[LOCADOR / LOCATÁRIO]</strong>.</li>
</ol>

<h2>CLÁUSULA 8ª – DAS OBRIGAÇÕES DO LOCATÁRIO</h2>
<ol>
<li>Pagar pontualmente o aluguel e demais encargos nos prazos estabelecidos;</li>
<li>Tratar o imóvel com o devido cuidado, conservando-o em bom estado;</li>
<li>Não realizar obras, modificações ou benfeitorias sem prévia autorização escrita do LOCADOR;</li>
<li>Não sublocar, ceder ou emprestar o imóvel, no todo ou em parte, sem autorização;</li>
<li>Comunicar imediatamente ao LOCADOR qualquer dano, avaria ou necessidade de reparos;</li>
<li>Não manter no imóvel substâncias ou materiais que possam causar danos ou que sejam proibidos por lei;</li>
<li>Respeitar as normas de convivência do condomínio, se houver;</li>
<li>Devolver o imóvel ao final do contrato em perfeitas condições, conforme laudo de vistoria.</li>
</ol>

<h2>CLÁUSULA 9ª – DAS OBRIGAÇÕES DO LOCADOR</h2>
<ol>
<li>Entregar o imóvel em boas condições de uso e habitabilidade;</li>
<li>Garantir ao LOCATÁRIO o uso pacífico do imóvel durante a vigência do contrato;</li>
<li>Realizar reparos estruturais e de manutenção que não sejam decorrentes do uso ordinário;</li>
<li>Fornecer recibo de pagamento ao LOCATÁRIO;</li>
<li>Não interferir no uso do imóvel pelo LOCATÁRIO.</li>
</ol>

<h2>CLÁUSULA 10ª – DA MULTA POR INADIMPLÊNCIA</h2>
<p>O atraso no pagamento do aluguel ou de qualquer encargo acarretará: <strong>multa de 10% (dez por cento)</strong> sobre o valor due, <strong>juros de mora de 1% (um por cento) ao mês</strong> e <strong>correção monetária</strong> pelo IGP-M/IPCA, sem prejuízo das demais penalidades legais.</p>

<h2>CLÁUSULA 11ª – DA RESCISÃO ANTECIPADA</h2>
<p>Em caso de rescisão antecipada do contrato por iniciativa do LOCATÁRIO, será devida ao LOCADOR multa rescisória equivalente a <strong>[N] meses de aluguel</strong>, calculada proporcionalmente ao período remanescente do contrato, nos termos do art. 4º da Lei nº 8.245/91.</p>
<p>O LOCATÁRIO que rescindir o contrato em virtude de transferência de trabalho comunicada por escrito pelo empregador, com antecedência mínima de 30 dias, ficará isento da multa rescisória, conforme parágrafo único do art. 4º da Lei nº 8.245/91.</p>

<h2>CLÁUSULA 12ª – DAS BENFEITORIAS</h2>
<p>As benfeitorias necessárias realizadas pelo LOCATÁRIO, ainda que não autorizadas, serão indenizadas pelo LOCADOR. As benfeitorias úteis somente serão indenizadas se autorizadas previamente por escrito. As benfeitorias voluptuárias não serão indenizadas, podendo o LOCATÁRIO retirá-las ao final do contrato, desde que não danifique o imóvel.</p>

<h2>CLÁUSULA 13ª – DA VISTORIA</h2>
<p>As partes procedem, nesta data, à vistoria do imóvel, cujo laudo descritivo encontra-se em anexo a este instrumento, dele fazendo parte integrante. O LOCATÁRIO compromete-se a devolver o imóvel nas mesmas condições do laudo de entrada, ressalvado o desgaste natural pelo uso normal.</p>

<h2>CLÁUSULA 14ª – DO FORO</h2>
<p>As partes elegem o foro da Comarca de <strong>[CIDADE]</strong> – <strong>[ESTADO]</strong> para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>

<p>E por estarem as partes de acordo com todas as cláusulas e condições acima, assinam o presente instrumento em <strong>2 (duas)</strong> vias de igual teor e forma, na presença das testemunhas abaixo identificadas.</p>

<p style="margin-top: 40px;"><strong>[CIDADE]</strong>, <strong>[DATA]</strong></p>

<br><br>
<p>________________________________________<br>
<strong>LOCADOR(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>LOCATÁRIO(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>FIADOR(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p><strong>TESTEMUNHAS:</strong></p>
<p>1. ________________________________________<br>
Nome: [NOME] | CPF: [CPF]</p>
<p>2. ________________________________________<br>
Nome: [NOME] | CPF: [CPF]</p>`,
  },
  {
    tipo: "ALUGUEL_COMERCIAL",
    titulo: "Contrato de Aluguel Comercial",
    descricao: "Locação de imóvel para fins comerciais e empresariais",
    icone: "🏢",
    cor: "purple",
    conteudo: `<h1 style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 8px;">CONTRATO DE LOCAÇÃO COMERCIAL</h1>
<p style="text-align: center; margin-bottom: 24px;"><em>Regido pela Lei nº 8.245/91 – Locação Não Residencial</em></p>

<p>Pelo presente instrumento particular de contrato de locação comercial, as partes abaixo identificadas celebram entre si o presente contrato:</p>

<h2>DAS PARTES</h2>
<p><strong>LOCADOR(A):</strong> [NOME COMPLETO / RAZÃO SOCIAL]<br>
<strong>CPF/CNPJ:</strong> [CPF/CNPJ] | <strong>RG/IE:</strong> [RG/IE]<br>
<strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Representante Legal (se PJ):</strong> [NOME DO REPRESENTANTE]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>LOCATÁRIO(A):</strong> [NOME COMPLETO / RAZÃO SOCIAL]<br>
<strong>CPF/CNPJ:</strong> [CPF/CNPJ] | <strong>RG/IE:</strong> [RG/IE]<br>
<strong>Endereço:</strong> [ENDEREÇO ATUAL]<br>
<strong>Representante Legal (se PJ):</strong> [NOME DO REPRESENTANTE]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<h2>CLÁUSULA 1ª – DO OBJETO</h2>
<p>O presente contrato tem por objeto a locação do imóvel comercial situado à <strong>[ENDEREÇO COMPLETO]</strong>, bairro <strong>[BAIRRO]</strong>, cidade de <strong>[CIDADE]</strong> – <strong>[ESTADO]</strong>, CEP <strong>[CEP]</strong>, com área de <strong>[ÁREA]</strong> m², composto de <strong>[DESCRIÇÃO]</strong>, destinado ao uso <strong>[FINALIDADE COMERCIAL: ex. escritório, comércio varejista, prestação de serviços]</strong>.</p>

<h2>CLÁUSULA 2ª – DA FINALIDADE</h2>
<p>O imóvel objeto deste contrato será utilizado pelo LOCATÁRIO exclusivamente para <strong>[DESCRIÇÃO DA ATIVIDADE COMERCIAL]</strong>, inscrita sob o CNAE <strong>[CNAE]</strong>, sendo vedada qualquer alteração de finalidade sem prévia autorização escrita do LOCADOR.</p>

<h2>CLÁUSULA 3ª – DO PRAZO</h2>
<p>O prazo da locação é de <strong>[PRAZO] ([PRAZO POR EXTENSO])</strong> meses, com início em <strong>[DATA DE INÍCIO]</strong> e término em <strong>[DATA DE TÉRMINO]</strong>.</p>
<p>Nos contratos com prazo igual ou superior a 5 (cinco) anos, o LOCATÁRIO terá direito à renovação compulsória, nos termos do art. 51 da Lei nº 8.245/91, desde que cumpridos os requisitos legais.</p>

<h2>CLÁUSULA 4ª – DO ALUGUEL</h2>
<p>O aluguel mensal é fixado em <strong>R$ [VALOR] ([VALOR POR EXTENSO])</strong>, a ser pago até o dia <strong>[DIA]</strong> de cada mês, pelos seguintes dados:</p>
<p><strong>Banco:</strong> [BANCO] | <strong>Agência:</strong> [AGÊNCIA] | <strong>Conta:</strong> [CONTA]<br>
<strong>Chave PIX:</strong> [CHAVE PIX]</p>

<h2>CLÁUSULA 5ª – DO REAJUSTE</h2>
<p>O aluguel será reajustado anualmente pelo <strong>IGPM/FGV</strong> ou, alternativamente, pelo <strong>IPCA/IBGE</strong>, prevalecendo o que for acordado entre as partes a cada período.</p>

<h2>CLÁUSULA 6ª – DAS DESPESAS E ENCARGOS</h2>
<p>São de responsabilidade do LOCATÁRIO:</p>
<ol>
<li>IPTU e todas as taxas municipais incidentes sobre o imóvel;</li>
<li>Energia elétrica, água, gás, internet e demais utilidades;</li>
<li>Taxa de condomínio ordinária e extraordinária;</li>
<li>Licenças, alvarás e demais documentos necessários ao funcionamento do negócio;</li>
<li>Seguro do imóvel e de responsabilidade civil;</li>
<li>Manutenção, conservação e pequenos reparos do imóvel.</li>
</ol>

<h2>CLÁUSULA 7ª – DA GARANTIA</h2>
<p>Como garantia da locação, o LOCATÁRIO apresenta:</p>
<p>( ) <strong>Caução</strong> no valor de R$ [VALOR] – equivalente a [N] meses de aluguel<br>
( ) <strong>Fiança</strong> prestada por [NOME DO FIADOR], CPF [CPF], endereço [ENDEREÇO]<br>
( ) <strong>Seguro-Fiança</strong> pela seguradora [NOME DA SEGURADORA], apólice nº [NÚMERO]</p>

<h2>CLÁUSULA 8ª – DAS OBRAS E ADAPTAÇÕES</h2>
<p>O LOCATÁRIO poderá realizar obras de adaptação necessárias ao desenvolvimento de suas atividades, desde que mediante autorização escrita prévia do LOCADOR, não comprometendo a estrutura do imóvel. Ao término do contrato, o LOCATÁRIO deverá, a critério do LOCADOR, remover as adaptações e restaurar o imóvel ao estado original ou deixar as benfeitorias sem direito a indenização, salvo acordo em contrário.</p>

<h2>CLÁUSULA 9ª – DA RESCISÃO ANTECIPADA</h2>
<p>A rescisão antecipada imotivada pelo LOCATÁRIO ensejará o pagamento de multa equivalente a <strong>[N] meses</strong> de aluguel vigente, proporcional ao tempo remanescente do contrato.</p>

<h2>CLÁUSULA 10ª – DA MULTA POR INADIMPLÊNCIA</h2>
<p>O inadimplemento de qualquer obrigação pecuniária acarretará multa de <strong>10%</strong>, juros moratórios de <strong>1% ao mês</strong> e correção monetária pelo IGPM/IPCA.</p>

<h2>CLÁUSULA 11ª – DA CESSÃO E SUBLOCAÇÃO</h2>
<p>É vedada a cessão ou sublocação total ou parcial do imóvel sem prévia autorização escrita do LOCADOR, sob pena de rescisão contratual imediata.</p>

<h2>CLÁUSULA 12ª – DO FORO</h2>
<p>Fica eleito o foro da Comarca de <strong>[CIDADE] – [ESTADO]</strong> para dirimir quaisquer litígios decorrentes deste contrato.</p>

<p style="margin-top: 40px;"><strong>[CIDADE]</strong>, <strong>[DATA]</strong></p>

<br><br>
<p>________________________________________<br>
<strong>LOCADOR(A):</strong> [NOME/RAZÃO SOCIAL]<br>CPF/CNPJ: [CPF/CNPJ]</p>

<br>
<p>________________________________________<br>
<strong>LOCATÁRIO(A):</strong> [NOME/RAZÃO SOCIAL]<br>CPF/CNPJ: [CPF/CNPJ]</p>

<br>
<p><strong>TESTEMUNHAS:</strong></p>
<p>1. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>
<p>2. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>`,
  },
  {
    tipo: "COMPRA_VENDA",
    titulo: "Contrato de Compra e Venda de Imóvel",
    descricao: "Instrumento de compra e venda de bem imóvel com todas as cláusulas essenciais",
    icone: "📋",
    cor: "green",
    conteudo: `<h1 style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 8px;">CONTRATO PARTICULAR DE COMPRA E VENDA DE IMÓVEL</h1>
<p style="text-align: center; margin-bottom: 24px;"><em>Nos termos dos arts. 481 e seguintes do Código Civil Brasileiro</em></p>

<p>Por este instrumento particular de compra e venda de imóvel, as partes abaixo qualificadas celebram entre si o presente contrato, que se regula pelas seguintes cláusulas e condições:</p>

<h2>DAS PARTES</h2>
<p><strong>VENDEDOR(A):</strong> [NOME COMPLETO]<br>
<strong>Nacionalidade:</strong> [NACIONALIDADE] | <strong>Estado Civil:</strong> [ESTADO CIVIL]<br>
<strong>Profissão:</strong> [PROFISSÃO]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>CÔNJUGE DO VENDEDOR (se casado):</strong> [NOME DO CÔNJUGE]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Regime de Bens:</strong> [REGIME DE BENS]</p>

<p><strong>COMPRADOR(A):</strong> [NOME COMPLETO]<br>
<strong>Nacionalidade:</strong> [NACIONALIDADE] | <strong>Estado Civil:</strong> [ESTADO CIVIL]<br>
<strong>Profissão:</strong> [PROFISSÃO]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<h2>CLÁUSULA 1ª – DO OBJETO</h2>
<p>O presente contrato tem por objeto a venda do imóvel descrito a seguir:</p>
<p><strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Bairro:</strong> [BAIRRO] | <strong>Cidade:</strong> [CIDADE] | <strong>Estado:</strong> [ESTADO] | <strong>CEP:</strong> [CEP]<br>
<strong>Matrícula nº:</strong> [NÚMERO DA MATRÍCULA] no Cartório de Registro de Imóveis de [CARTÓRIO]<br>
<strong>Área Total:</strong> [ÁREA TOTAL] m² | <strong>Área Construída:</strong> [ÁREA CONSTRUÍDA] m²<br>
<strong>Descrição:</strong> [DESCRIÇÃO DETALHADA DO IMÓVEL]</p>

<h2>CLÁUSULA 2ª – DO PREÇO</h2>
<p>O imóvel descrito na cláusula anterior é vendido pelo preço certo e ajustado de <strong>R$ [VALOR TOTAL] ([VALOR POR EXTENSO])</strong>, que será pago pelo COMPRADOR ao VENDEDOR da seguinte forma:</p>
<ol>
<li><strong>Sinal e princípio de pagamento:</strong> R$ [VALOR DO SINAL], pago nesta data;</li>
<li><strong>Parcela intermediária:</strong> R$ [VALOR], a ser paga até [DATA];</li>
<li><strong>Saldo devedor:</strong> R$ [SALDO], a ser pago no ato da lavratura da escritura definitiva, prevista para [DATA ESTIMADA].</li>
</ol>

<h2>CLÁUSULA 3ª – DO SINAL</h2>
<p>O sinal pago nesta data, no valor de <strong>R$ [VALOR DO SINAL]</strong>, tem caráter de arras confirmatórias, nos termos dos arts. 417 e 418 do Código Civil. Em caso de desistência por parte do COMPRADOR, o sinal será perdido em favor do VENDEDOR. Em caso de desistência por parte do VENDEDOR, este devolverá o sinal em dobro ao COMPRADOR.</p>

<h2>CLÁUSULA 4ª – DA ESCRITURA DEFINITIVA</h2>
<p>A escritura definitiva de compra e venda será lavrada no Cartório de Notas de livre escolha das partes, no prazo de <strong>[PRAZO]</strong> após o pagamento integral do preço, ficando a cargo do COMPRADOR todas as despesas cartorárias, ITBI (Imposto de Transmissão de Bens Imóveis) e custas de registro.</p>

<h2>CLÁUSULA 5ª – DA POSSE E ENTREGA DAS CHAVES</h2>
<p>A posse do imóvel será transferida ao COMPRADOR na data de <strong>[DATA DE ENTREGA]</strong>, mediante quitação integral do preço ou conforme acordado entre as partes. A entrega das chaves ocorrerá no ato da assinatura da escritura definitiva.</p>

<h2>CLÁUSULA 6ª – DAS RESPONSABILIDADES</h2>
<p>Até a data da entrega das chaves, ficam a cargo do VENDEDOR: IPTU, taxa de condomínio, água, luz e demais encargos. A partir da entrega das chaves, todas as despesas passam a ser de responsabilidade do COMPRADOR.</p>

<h2>CLÁUSULA 7ª – DAS DECLARAÇÕES DO VENDEDOR</h2>
<p>O VENDEDOR declara, sob as penas da lei:</p>
<ol>
<li>Que é o legítimo proprietário do imóvel, conforme matrícula;</li>
<li>Que o imóvel está livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, penhoras ou gravames;</li>
<li>Que inexistem ações judiciais ou administrativas que possam afetar a propriedade do imóvel;</li>
<li>Que estão quitados todos os tributos, taxas e contribuições incidentes sobre o imóvel até a presente data;</li>
<li>Que o imóvel não está ocupado por terceiros com direitos sobre ele.</li>
</ol>

<h2>CLÁUSULA 8ª – DA EVICÇÃO E VÍCIOS REDIBITÓRIOS</h2>
<p>O VENDEDOR responde pela evicção e pelos vícios redibitórios do imóvel, nos termos dos arts. 447 e 441 do Código Civil Brasileiro.</p>

<h2>CLÁUSULA 9ª – DA MULTA POR INADIMPLEMENTO</h2>
<p>O descumprimento de qualquer cláusula deste contrato pela parte infratora acarretará multa equivalente a <strong>[N]% ([N POR EXTENSO] por cento)</strong> sobre o valor total do contrato, além das perdas e danos comprovados.</p>

<h2>CLÁUSULA 10ª – DA INTERMEDIAÇÃO IMOBILIÁRIA</h2>
<p>A intermediação imobiliária foi realizada pelo(a) corretor(a) <strong>[NOME DO CORRETOR]</strong>, CRECI nº <strong>[NÚMERO DO CRECI]</strong>, cabendo-lhe honorários de <strong>[N]% ([N POR EXTENSO] por cento)</strong> sobre o valor da venda, a serem pagos pelo <strong>[VENDEDOR / COMPRADOR / AMBOS]</strong>.</p>

<h2>CLÁUSULA 11ª – DO FORO</h2>
<p>Fica eleito o foro da Comarca de <strong>[CIDADE] – [ESTADO]</strong> para dirimir quaisquer litígios oriundos deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.</p>

<p style="margin-top: 40px;"><strong>[CIDADE]</strong>, <strong>[DATA]</strong></p>

<br><br>
<p>________________________________________<br>
<strong>VENDEDOR(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>CÔNJUGE DO VENDEDOR:</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>COMPRADOR(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>CORRETOR IMOBILIÁRIO:</strong> [NOME]<br>CRECI: [CRECI]</p>

<br>
<p><strong>TESTEMUNHAS:</strong></p>
<p>1. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>
<p>2. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>`,
  },
  {
    tipo: "INTERMEDIACAO",
    titulo: "Contrato de Intermediação Imobiliária",
    descricao: "Autorização de venda/locação e comissão do corretor de imóveis",
    icone: "🤝",
    cor: "orange",
    conteudo: `<h1 style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 8px;">CONTRATO DE INTERMEDIAÇÃO IMOBILIÁRIA</h1>
<p style="text-align: center; margin-bottom: 8px;"><em>Autorização para Venda / Locação de Imóvel</em></p>
<p style="text-align: center; margin-bottom: 24px;"><em>Nos termos da Lei nº 6.530/78 e do Decreto nº 81.871/78</em></p>

<p>Por este instrumento particular de intermediação imobiliária, as partes a seguir qualificadas ajustam entre si:</p>

<h2>DAS PARTES</h2>
<p><strong>CONTRATANTE (Proprietário):</strong> [NOME COMPLETO]<br>
<strong>CPF/CNPJ:</strong> [CPF/CNPJ] | <strong>RG:</strong> [RG]<br>
<strong>Estado Civil:</strong> [ESTADO CIVIL] | <strong>Profissão:</strong> [PROFISSÃO]<br>
<strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>CONTRATADO (Corretor de Imóveis):</strong> [NOME COMPLETO DO CORRETOR]<br>
<strong>CRECI:</strong> [NÚMERO DO CRECI] | <strong>CPF/CNPJ:</strong> [CPF/CNPJ]<br>
<strong>Endereço Profissional:</strong> [ENDEREÇO]<br>
<strong>Telefone:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]<br>
<strong>Imobiliária (se houver):</strong> [NOME DA IMOBILIÁRIA], CNPJ: [CNPJ], CRECI-J: [CRECI-J]</p>

<h2>CLÁUSULA 1ª – DO OBJETO</h2>
<p>O presente contrato tem por objeto a intermediação imobiliária para a <strong>[VENDA / LOCAÇÃO]</strong> do imóvel de propriedade do CONTRATANTE, com as seguintes características:</p>
<p><strong>Endereço:</strong> [ENDEREÇO COMPLETO]<br>
<strong>Bairro:</strong> [BAIRRO] | <strong>Cidade:</strong> [CIDADE] | <strong>Estado:</strong> [ESTADO]<br>
<strong>Matrícula nº:</strong> [MATRÍCULA] no CRI de [CARTÓRIO]<br>
<strong>Área:</strong> [ÁREA] m² | <strong>Descrição:</strong> [DESCRIÇÃO RESUMIDA]<br>
<strong>Valor de oferta:</strong> R$ [VALOR DE OFERTA]</p>

<h2>CLÁUSULA 2ª – DA EXCLUSIVIDADE</h2>
<p>( ) <strong>COM EXCLUSIVIDADE:</strong> O CONTRATANTE outorga ao CONTRATADO, com exclusividade, o direito de intermediar a negociação pelo prazo estipulado neste contrato. Caso o imóvel seja vendido/locado diretamente pelo proprietário ou por outro corretor durante o prazo de exclusividade, a comissão será devida integralmente ao CONTRATADO.</p>
<p>( ) <strong>SEM EXCLUSIVIDADE:</strong> O CONTRATANTE poderá contratar simultaneamente outros corretores, sendo devida a comissão apenas ao corretor que efetivamente realizar o negócio.</p>

<h2>CLÁUSULA 3ª – DO PRAZO</h2>
<p>O prazo de vigência desta autorização é de <strong>[PRAZO] ([PRAZO POR EXTENSO])</strong> dias/meses, a contar da assinatura deste instrumento, podendo ser prorrogado por igual período mediante acordo mútuo.</p>

<h2>CLÁUSULA 4ª – DA COMISSÃO</h2>
<p>Pela intermediação realizada com sucesso, o CONTRATANTE pagará ao CONTRATADO honorários correspondentes a <strong>[N]% ([N POR EXTENSO] por cento)</strong> sobre o valor total da <strong>[venda / locação]</strong>, conforme tabela do CRECI/<strong>[ESTADO]</strong>, a ser pago:</p>
<p>( ) No ato da assinatura do contrato de venda/locação<br>
( ) No ato da lavratura da escritura definitiva<br>
( ) Conforme acordado: [CONDIÇÃO ESPECÍFICA]</p>

<h2>CLÁUSULA 5ª – DAS OBRIGAÇÕES DO CONTRATADO</h2>
<ol>
<li>Divulgar o imóvel nos canais disponíveis (portais, redes sociais, carteira de clientes);</li>
<li>Apresentar o imóvel somente a candidatos qualificados e com real interesse;</li>
<li>Manter o CONTRATANTE informado sobre as visitas e negociações;</li>
<li>Agir com ética, transparência e boa-fé em todas as tratativas;</li>
<li>Assessorar na análise de propostas e contra-propostas;</li>
<li>Auxiliar na coleta de documentação necessária para a conclusão do negócio;</li>
<li>Zelar pelos interesses do CONTRATANTE na negociação.</li>
</ol>

<h2>CLÁUSULA 6ª – DAS OBRIGAÇÕES DO CONTRATANTE</h2>
<ol>
<li>Fornecer todos os documentos necessários ao imóvel (matrícula, certidões, IPTU, etc.);</li>
<li>Permitir o acesso do CONTRATADO e de potenciais compradores/locatários ao imóvel;</li>
<li>Manter o CONTRATADO informado sobre qualquer negociação direta;</li>
<li>Pagar a comissão nos termos acordados, quando concluído o negócio;</li>
<li>Informar previamente qualquer limitação ou ônus que recaia sobre o imóvel.</li>
</ol>

<h2>CLÁUSULA 7ª – DO DIREITO À COMISSÃO</h2>
<p>A comissão será devida ao CONTRATADO quando:</p>
<ol>
<li>O negócio for concluído durante a vigência deste contrato;</li>
<li>O negócio for concluído após o vencimento, mas com comprador/locatário apresentado pelo CONTRATADO durante a vigência;</li>
<li>O CONTRATANTE dispensar o CONTRATADO após este já ter obtido proposta válida.</li>
</ol>

<h2>CLÁUSULA 8ª – DA RESCISÃO</h2>
<p>O presente contrato poderá ser rescindido por qualquer das partes, mediante notificação escrita com antecedência mínima de <strong>[N] dias</strong>, sendo devida ao CONTRATADO a comissão pelas negociações já em andamento que se concluírem após a rescisão.</p>

<h2>CLÁUSULA 9ª – DO FORO</h2>
<p>Fica eleito o foro da Comarca de <strong>[CIDADE] – [ESTADO]</strong> para dirimir quaisquer litígios.</p>

<p style="margin-top: 40px;"><strong>[CIDADE]</strong>, <strong>[DATA]</strong></p>

<br><br>
<p>________________________________________<br>
<strong>CONTRATANTE (Proprietário):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>CONTRATADO (Corretor):</strong> [NOME]<br>CRECI: [CRECI] | CPF: [CPF]</p>

<br>
<p><strong>TESTEMUNHAS:</strong></p>
<p>1. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>
<p>2. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>`,
  },
  {
    tipo: "LOCACAO_TEMPORADA",
    titulo: "Contrato de Locação por Temporada",
    descricao: "Locação de curto prazo (até 90 dias) para férias e temporada",
    icone: "🏖️",
    cor: "teal",
    conteudo: `<h1 style="text-align: center; font-size: 1.4em; font-weight: bold; margin-bottom: 8px;">CONTRATO DE LOCAÇÃO POR TEMPORADA</h1>
<p style="text-align: center; margin-bottom: 8px;"><em>Locação de curta duração – máximo 90 (noventa) dias</em></p>
<p style="text-align: center; margin-bottom: 24px;"><em>Nos termos dos arts. 48 a 50 da Lei nº 8.245/91</em></p>

<p>As partes abaixo qualificadas celebram o presente Contrato de Locação por Temporada, que se regula pelas seguintes cláusulas:</p>

<h2>DAS PARTES</h2>
<p><strong>LOCADOR(A):</strong> [NOME COMPLETO]<br>
<strong>CPF/CNPJ:</strong> [CPF/CNPJ] | <strong>RG:</strong> [RG]<br>
<strong>Endereço para correspondência:</strong> [ENDEREÇO]<br>
<strong>Telefone/WhatsApp:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<p><strong>LOCATÁRIO(A):</strong> [NOME COMPLETO]<br>
<strong>CPF:</strong> [CPF] | <strong>RG:</strong> [RG]<br>
<strong>Endereço residencial:</strong> [ENDEREÇO]<br>
<strong>Telefone/WhatsApp:</strong> [TELEFONE] | <strong>E-mail:</strong> [E-MAIL]</p>

<h2>CLÁUSULA 1ª – DO IMÓVEL</h2>
<p>O LOCADOR cede em locação por temporada o imóvel situado à <strong>[ENDEREÇO COMPLETO]</strong>, bairro/região <strong>[BAIRRO]</strong>, cidade de <strong>[CIDADE]</strong> – <strong>[ESTADO]</strong>, CEP <strong>[CEP]</strong>, sendo uma propriedade composta de <strong>[DESCRIÇÃO: quartos, banheiros, vagas, etc.]</strong>, com capacidade máxima para <strong>[N] pessoas</strong>.</p>
<p>O imóvel será entregue <strong>mobiliado e equipado</strong> conforme inventário em anexo, com toda a estrutura necessária para habitação temporária.</p>

<h2>CLÁUSULA 2ª – DA FINALIDADE</h2>
<p>A locação destina-se exclusivamente para fins de <strong>[FÉRIAS / TURISMO / TRATAMENTO DE SAÚDE / OBRA NO IMÓVEL PRINCIPAL]</strong>, sendo vedado qualquer uso comercial, realização de festas e eventos com número de pessoas superior à capacidade do imóvel.</p>

<h2>CLÁUSULA 3ª – DO PERÍODO E HORÁRIOS</h2>
<p><strong>Check-in:</strong> dia <strong>[DATA DE ENTRADA]</strong> às <strong>[HORÁRIO]</strong>h<br>
<strong>Check-out:</strong> dia <strong>[DATA DE SAÍDA]</strong> até <strong>[HORÁRIO]</strong>h</p>
<p><strong>Total de diárias:</strong> <strong>[N] ([N POR EXTENSO])</strong> dias</p>
<p>O check-out após o horário estabelecido, sem prévia autorização, sujeita o LOCATÁRIO ao pagamento de <strong>uma diária adicional</strong> completa.</p>

<h2>CLÁUSULA 4ª – DO PREÇO E PAGAMENTO</h2>
<p><strong>Valor por diária:</strong> R$ [VALOR DA DIÁRIA]<br>
<strong>Valor total da locação:</strong> R$ [VALOR TOTAL] ([VALOR POR EXTENSO])</p>
<p><strong>Forma de pagamento:</strong></p>
<ol>
<li>Sinal de reserva: R$ [VALOR DO SINAL] – pago até <strong>[DATA]</strong>;</li>
<li>Saldo restante: R$ [SALDO] – pago até <strong>[DATA ou "no ato do check-in"]</strong>.</li>
</ol>
<p><strong>Dados para pagamento:</strong><br>
<strong>PIX:</strong> [CHAVE PIX] | <strong>Titular:</strong> [NOME]<br>
<strong>Banco:</strong> [BANCO] | <strong>Ag.:</strong> [AG.] | <strong>Conta:</strong> [CONTA]</p>

<h2>CLÁUSULA 5ª – DA CAUÇÃO/TAXA DE DANOS</h2>
<p>O LOCATÁRIO depositará, como caução para garantia contra danos, o valor de <strong>R$ [VALOR DA CAUÇÃO]</strong>, a ser devolvido integralmente em até <strong>[N] dias</strong> após o check-out, mediante vistoria do imóvel e do inventário. Serão descontados eventuais danos, itens faltantes ou despesas adicionais.</p>

<h2>CLÁUSULA 6ª – DAS REGRAS DE USO DO IMÓVEL</h2>
<ol>
<li>É permitida a hospedagem de no máximo <strong>[N] pessoas</strong>. Hóspedes adicionais deverão ser informados e poderão gerar cobrança extra;</li>
<li>Não é permitida a realização de <strong>festas ou eventos</strong> sem autorização prévia e por escrito do LOCADOR;</li>
<li>Não é permitido o uso de <strong>churrasqueira/fogos de artifício</strong> sem autorização (se aplicável);</li>
<li>É proibida a entrada de <strong>animais de estimação</strong> sem autorização prévia;</li>
<li>Manter o imóvel em ordem, realizando a lavagem de louças e descarte correto do lixo;</li>
<li>Respeitar o silêncio após as <strong>22h</strong>, atendendo às normas do condomínio/vizinhança;</li>
<li>Não fumar dentro do imóvel;</li>
<li>Não remover ou danificar qualquer item do inventário do imóvel.</li>
</ol>

<h2>CLÁUSULA 7ª – DAS DESPESAS DURANTE A TEMPORADA</h2>
<p>Ficam a cargo do LOCATÁRIO as despesas com:</p>
<ol>
<li>Consumo de energia elétrica excedente ao limite de [LIMITE KWH/R$], se estipulado;</li>
<li>Consumo de água, gás, internet (se não inclusos);</li>
<li>Reposição de itens de higiene, cozinha e limpeza consumidos durante a estadia.</li>
</ol>
<p>Ficam inclusos no valor da locação: [DESCREVER O QUE ESTÁ INCLUSO]</p>

<h2>CLÁUSULA 8ª – DA POLÍTICA DE CANCELAMENTO</h2>
<p>Em caso de cancelamento pelo LOCATÁRIO:</p>
<ol>
<li>Com mais de <strong>[N] dias</strong> de antecedência: reembolso integral do valor pago, exceto taxa administrativa de R$ [TAXA];</li>
<li>Entre <strong>[N] e [N] dias</strong> de antecedência: reembolso de <strong>[N]%</strong> do valor pago;</li>
<li>Com menos de <strong>[N] dias</strong> ou no-show: <strong>sem reembolso</strong>.</li>
</ol>
<p>Em caso de cancelamento pelo LOCADOR: devolução integral dos valores pagos mais indenização de <strong>[N]%</strong> sobre o valor total.</p>

<h2>CLÁUSULA 9ª – DA RESPONSABILIDADE</h2>
<p>O LOCATÁRIO é responsável por quaisquer danos causados ao imóvel, mobiliário e equipamentos durante o período da locação, incluindo danos causados por seus acompanhantes. O LOCADOR não se responsabiliza por objetos de valor deixados no imóvel, roubos ou acidentes.</p>

<h2>CLÁUSULA 10ª – DO FORO</h2>
<p>Fica eleito o foro da Comarca de <strong>[CIDADE] – [ESTADO]</strong> para dirimir quaisquer litígios decorrentes deste contrato.</p>

<p style="margin-top: 40px;"><strong>[CIDADE]</strong>, <strong>[DATA]</strong></p>

<br><br>
<p>________________________________________<br>
<strong>LOCADOR(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p>________________________________________<br>
<strong>LOCATÁRIO(A):</strong> [NOME]<br>CPF: [CPF]</p>

<br>
<p><strong>TESTEMUNHAS:</strong></p>
<p>1. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>
<p>2. ________________________________________<br>Nome: [NOME] | CPF: [CPF]</p>`,
  },
];
