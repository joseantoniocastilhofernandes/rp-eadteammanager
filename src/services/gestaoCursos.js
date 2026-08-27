import axios from 'axios'
import { SERVICES_CONTEXT } from 'src/@core/constants/constants.js'

/**
 * Chamadas da gestão de cursos.
 *
 * O idGestor identifica quem está operando; o servidor resolve o produtor
 * a partir dele. Nenhuma tela envia idProdutor.
 */

function gestor() {
  const stored = sessionStorage.getItem('loggedUser')
  if (!stored) throw new Error('SEM_SESSAO')

  return JSON.parse(stored).idUsuario
}

function desembrulhar({ data }) {
  if (data?.result?.error) {
    const erro = new Error(data.result.errorCodes?.[0] || 'ERRO_INTERNO')
    erro.codigo = data.result.errorCodes?.[0]
    throw erro
  }

  return data.result
}

// ── biblioteca de vídeo ───────────────────────────────────────────────

export async function verificarBiblioteca() {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/biblioteca`, { params: { idGestor: gestor() } })
    .then(desembrulhar)
}

export async function criarBiblioteca() {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/biblioteca`, { idGestor: gestor() })
    .then(desembrulhar)
}

// ── cursos ────────────────────────────────────────────────────────────

export async function listarCursos() {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/curso`, { params: { idGestor: gestor() } })
    .then(desembrulhar)
}

export async function carregarCurso(idCurso) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/curso`, { params: { idGestor: gestor(), idCurso } })
    .then(desembrulhar)
}

export async function criarCurso(nome, sobre) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/curso`, { idGestor: gestor(), nome, sobre })
    .then(desembrulhar)
}

export async function editarCurso(idCurso, campos) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/curso`, { idGestor: gestor(), idCurso, ...campos })
    .then(desembrulhar)
}

/** status: 'rascunho' | 'publicado' */
export async function alterarStatusDoCurso(idCurso, status) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/curso`, { idGestor: gestor(), idCurso, status })
    .then(desembrulhar)
}

export async function inativarCurso(idCurso) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/curso`, { params: { idGestor: gestor(), idCurso } })
    .then(desembrulhar)
}

// ── módulos ───────────────────────────────────────────────────────────

export async function criarModulo(idCurso, nome) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/modulo`, { idGestor: gestor(), idCurso, nome })
    .then(desembrulhar)
}

export async function editarModulo(idModulo, campos) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/modulo`, { idGestor: gestor(), idModulo, ...campos })
    .then(desembrulhar)
}

export async function reordenarModulos(idCurso, ordem) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/modulo`, { idGestor: gestor(), idCurso, ordem })
    .then(desembrulhar)
}

export async function excluirModulo(idModulo) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/modulo`, { params: { idGestor: gestor(), idModulo } })
    .then(desembrulhar)
}

/** Dados do módulo com as aulas dele. */
export async function carregarModulo(idModulo) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/modulo`, { params: { idGestor: gestor(), idModulo } })
    .then(desembrulhar)
}

// ── provas ────────────────────────────────────────────────────────────

export async function carregarProva(idModulo) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/prova`, { params: { idGestor: gestor(), idModulo } })
    .then(desembrulhar)
}

export async function criarProva(idModulo, titulo) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idModulo, titulo })
    .then(desembrulhar)
}

export async function editarProva(idProva, campos) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idProva, ...campos })
    .then(desembrulhar)
}

export async function criarQuestao(idProva, enunciado) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idProva, enunciado })
    .then(desembrulhar)
}

export async function editarQuestao(idQuestao, campos) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idQuestao, ...campos })
    .then(desembrulhar)
}

export async function excluirQuestao(idQuestao) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/prova`, { params: { idGestor: gestor(), idQuestao } })
    .then(desembrulhar)
}

export async function criarAlternativa(idQuestao, texto) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idQuestao, texto })
    .then(desembrulhar)
}

export async function editarAlternativa(idAlternativa, campos) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/prova`, { idGestor: gestor(), idAlternativa, ...campos })
    .then(desembrulhar)
}

export async function excluirAlternativa(idAlternativa) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/prova`, { params: { idGestor: gestor(), idAlternativa } })
    .then(desembrulhar)
}

// ── aulas ─────────────────────────────────────────────────────────────

/** Cria a aula e já devolve a assinatura para enviar o arquivo. */
export async function criarAula(idModulo, nome) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/aula`, { idGestor: gestor(), idModulo, nome })
    .then(desembrulhar)
}

export async function editarAula(idAula, nome) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/aula`, { idGestor: gestor(), idAula, nome })
    .then(desembrulhar)
}

export async function reordenarAulas(idModulo, ordem) {
  return axios
    .put(`${SERVICES_CONTEXT}/gestao/aula`, { idGestor: gestor(), idModulo, ordem })
    .then(desembrulhar)
}

export async function excluirAula(idAula) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/aula`, { params: { idGestor: gestor(), idAula } })
    .then(desembrulhar)
}

/** Dados completos da aula, para a tela de edição. */
export async function carregarAula(idAula) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/aula`, { params: { idGestor: gestor(), idAula, detalhe: 1 } })
    .then(desembrulhar)
}

/** Cria um vídeo novo para a aula e devolve a assinatura de envio. */
export async function trocarVideoDaAula(idAula) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/aula`, { idGestor: gestor(), idAula })
    .then(desembrulhar)
}

/** Situação do processamento do vídeo na Bunny. */
export async function statusDaAula(idAula) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/aula`, { params: { idGestor: gestor(), idAula } })
    .then(desembrulhar)
}

// ── anexos ────────────────────────────────────────────────────────────

export async function listarAnexos(idAula) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/anexo`, { params: { idGestor: gestor(), idAula } })
    .then(desembrulhar)
}

/** Grava o registro e devolve a URL assinada para enviar o arquivo ao S3. */
export async function prepararAnexo(idAula, nome, extensao, descricao) {
  return axios
    .post(`${SERVICES_CONTEXT}/gestao/anexo`, { idGestor: gestor(), idAula, nome, extensao, descricao })
    .then(desembrulhar)
}

export async function excluirAnexo(idAnexo) {
  return axios
    .delete(`${SERVICES_CONTEXT}/gestao/anexo`, { params: { idGestor: gestor(), idAnexo } })
    .then(desembrulhar)
}

// ── consumo ───────────────────────────────────────────────────────────

export async function consumoDoMes() {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/consumo`, { params: { idGestor: gestor() } })
    .then(desembrulhar)
}

// ── mensagens ─────────────────────────────────────────────────────────

const MENSAGENS = {
  SEM_SESSAO: 'Sua sessão expirou. Faça login novamente.',
  SEM_PERMISSAO: 'Você não tem permissão para esta ação.',
  PRODUTOR_NAO_IDENTIFICADO: 'Sua conta não está vinculada a nenhum produtor ativo.',
  SEM_BIBLIOTECA: 'A biblioteca de vídeo ainda não foi criada.',
  BUNNY_INDISPONIVEL: 'O serviço de vídeo não respondeu. Tente de novo em instantes.',
  CURSO_NAO_ENCONTRADO: 'Curso não encontrado.',
  MODULO_NAO_ENCONTRADO: 'Módulo não encontrado.',
  AULA_NAO_ENCONTRADA: 'Aula não encontrada.',
  CAMPOS_OBRIGATORIOS: 'Preencha todos os campos.',
  CURSO_SEM_AULA_PUBLICADA: 'Publique ao menos um módulo com aulas antes de publicar o curso.',
  MODULO_SEM_AULA_PRONTA: 'Adicione ao menos uma aula com vídeo pronto antes de publicar o módulo.',
  STATUS_INVALIDO: 'Situação inválida.',
  MODULO_JA_TEM_PROVA: 'Este módulo já tem uma prova.',
  PROVA_NAO_ENCONTRADA: 'Prova não encontrada.',
  QUESTAO_NAO_ENCONTRADA: 'Questão não encontrada.',
  ALTERNATIVA_NAO_ENCONTRADA: 'Alternativa não encontrada.',
  MINIMO_DUAS_ALTERNATIVAS: 'A questão precisa de pelo menos duas alternativas.',
  PROVA_SEM_QUESTAO_VALIDA: 'Marque a resposta certa em pelo menos uma questão antes de publicar.',
  EXTENSAO_NAO_PERMITIDA: 'Formato não aceito. Use PDF, Word, Excel, PowerPoint, ZIP, JPG ou PNG.',
  ANEXO_NAO_ENCONTRADO: 'Anexo não encontrado.',
  ERRO_INTERNO: 'Algo deu errado. Tente novamente.',
}

export function mensagemDeErro(erro) {
  return MENSAGENS[erro?.codigo || erro?.message] || MENSAGENS.ERRO_INTERNO
}
