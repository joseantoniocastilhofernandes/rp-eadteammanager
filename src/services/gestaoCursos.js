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

/** Situação do processamento do vídeo na Bunny. */
export async function statusDaAula(idAula) {
  return axios
    .get(`${SERVICES_CONTEXT}/gestao/aula`, { params: { idGestor: gestor(), idAula } })
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
  ERRO_INTERNO: 'Algo deu errado. Tente novamente.',
}

export function mensagemDeErro(erro) {
  return MENSAGENS[erro?.codigo || erro?.message] || MENSAGENS.ERRO_INTERNO
}
