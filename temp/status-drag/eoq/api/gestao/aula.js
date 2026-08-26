import { getPool } from '../lib/db.js';
import { setCors } from '../lib/helpers.js';
import { autorizarGestao, podeEditarConteudo, moduloEhDoProdutor, aulaEhDoProdutor } from '../lib/autorizacao.js';
import { criarVideo, assinaturaDeUpload, statusDoVideo, excluirVideo, urlDoPlayer, credenciaisDoProdutor } from '../lib/bunny.js';

/**
 * Aulas.
 *
 *   POST   {idGestor, idModulo, nome}          cria a aula e o vídeo na Bunny,
 *                                              devolvendo a assinatura de upload
 *   GET    ?idGestor=...&idAula=...            consulta o encoding e grava a duração
 *   PUT    {idGestor, idAula, nome}            edita
 *   PUT    {idGestor, idModulo, ordem: [...]}  reordena
 *   DELETE ?idGestor=...&idAula=...            apaga a aula e o vídeo
 *
 * O arquivo NÃO passa por aqui: o navegador envia direto à Bunny com a
 * assinatura temporária. Função serverless tem limite de corpo e de tempo.
 */

const TIPO_AULA_BUNNY = 3;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const idGestor = String(req.query.idGestor ?? req.body?.idGestor ?? '').trim();

  const pool = getPool();
  const auth = await autorizarGestao(pool, idGestor);
  if (!auth.ok) return res.status(200).json({ result: { error: true, errorCodes: [auth.erro] } });
  if (!podeEditarConteudo(auth)) {
    return res.status(200).json({ result: { error: true, errorCodes: ['SEM_PERMISSAO'] } });
  }

  try {
    if (req.method === 'GET')    return await consultarVideo(pool, auth, req, res);
    if (req.method === 'POST')   return await criar(pool, auth, req, res);
    if (req.method === 'PUT')    return await atualizar(pool, auth, req, res);
    if (req.method === 'DELETE') return await excluir(pool, auth, req, res);
    return res.status(405).json({ result: { error: true, errorCodes: ['METHOD_NOT_ALLOWED'] } });
  } catch (err) {
    console.error('[gestao/aula] erro:', err.message);
    return res.status(500).json({ result: { error: true, errorCodes: ['ERRO_INTERNO'] } });
  }
}

// ── POST: cria a aula já pronta para receber o arquivo ─────────────────
async function criar(pool, auth, req, res) {
  const { idModulo, nome } = req.body || {};
  if (!idModulo || !nome?.trim()) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await moduloEhDoProdutor(pool, idModulo, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['MODULO_NAO_ENCONTRADO'] } });
  }

  // coleção do curso, para o vídeo nascer organizado na Bunny
  const { rows: cur } = await pool.query(
    `SELECT c.bunny_collection_id AS colecao
       FROM modulo m JOIN curso c ON c.id = m.id_curso
      WHERE m.id = $1`,
    [idModulo]
  );

  let idVideo, cred;
  try {
    cred = await credenciaisDoProdutor(pool, auth.idProdutor);
    idVideo = await criarVideo(cred, nome.trim(), cur[0]?.colecao);
  } catch (err) {
    if (err.message === 'SEM_BIBLIOTECA') {
      return res.status(200).json({ result: { error: true, errorCodes: ['SEM_BIBLIOTECA'] } });
    }
    console.error('[gestao/aula] Bunny indisponível:', err.message);
    return res.status(200).json({ result: { error: true, errorCodes: ['BUNNY_INDISPONIVEL'] } });
  }

  const { rows } = await pool.query(
    `INSERT INTO aula (id_modulo, id_tipo_aula, nome, ordem, id_video,
                       status_video, dh_cadastro, dh_ultima_alteracao)
     VALUES ($1, $2, $3,
             (SELECT COALESCE(max(ordem), 0) + 1 FROM aula WHERE id_modulo = $1),
             $4, 'enviando', NOW(), NOW())
     RETURNING id, ordem`,
    [idModulo, TIPO_AULA_BUNNY, nome.trim(), idVideo]
  );

  return res.status(200).json({
    result: {
      error: false,
      idAula: rows[0].id,
      ordem: rows[0].ordem,
      idVideo,
      upload: assinaturaDeUpload(cred, idVideo),
      urlPlayer: urlDoPlayer(cred, idVideo),
    },
  });
}

// ── GET: a tela pergunta de tempos em tempos se já processou ───────────
async function consultarVideo(pool, auth, req, res) {
  const idAula = req.query.idAula;
  if (!idAula) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await aulaEhDoProdutor(pool, idAula, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['AULA_NAO_ENCONTRADA'] } });
  }

  const { rows } = await pool.query(`SELECT id_video FROM aula WHERE id = $1`, [idAula]);
  const idVideo = rows[0]?.id_video;
  if (!idVideo) {
    return res.status(200).json({ result: { error: false, status: 'sem_video' } });
  }

  const cred = await credenciaisDoProdutor(pool, auth.idProdutor);
  const info = await statusDoVideo(cred, idVideo);

  // grava a duração assim que a Bunny termina de processar
  await pool.query(
    `UPDATE aula
        SET status_video = $2,
            duracao_segundos = COALESCE($3, duracao_segundos),
            dh_ultima_alteracao = NOW()
      WHERE id = $1`,
    [idAula, info.status, info.duracaoSegundos]
  );

  return res.status(200).json({
    result: { error: false, status: info.status, duracaoSegundos: info.duracaoSegundos },
  });
}

// ── PUT ────────────────────────────────────────────────────────────────
async function atualizar(pool, auth, req, res) {
  const { idAula, idModulo, nome, ordem } = req.body || {};

  if (Array.isArray(ordem) && idModulo) {
    if (!(await moduloEhDoProdutor(pool, idModulo, auth.idProdutor))) {
      return res.status(200).json({ result: { error: true, errorCodes: ['MODULO_NAO_ENCONTRADO'] } });
    }
    await pool.query(
      `UPDATE aula a SET ordem = n.pos, dh_ultima_alteracao = NOW()
         FROM unnest($2::bigint[]) WITH ORDINALITY AS n(id, pos)
        WHERE a.id = n.id AND a.id_modulo = $1`,
      [idModulo, ordem]
    );
    return res.status(200).json({ result: { error: false } });
  }

  if (!idAula || !nome?.trim()) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await aulaEhDoProdutor(pool, idAula, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['AULA_NAO_ENCONTRADA'] } });
  }

  await pool.query(
    `UPDATE aula SET nome = $2, dh_ultima_alteracao = NOW() WHERE id = $1`,
    [idAula, nome.trim()]
  );
  return res.status(200).json({ result: { error: false } });
}

// ── DELETE ─────────────────────────────────────────────────────────────
async function excluir(pool, auth, req, res) {
  const idAula = req.query.idAula ?? req.body?.idAula;
  if (!idAula) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await aulaEhDoProdutor(pool, idAula, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['AULA_NAO_ENCONTRADA'] } });
  }

  const { rows } = await pool.query(`SELECT id_video FROM aula WHERE id = $1`, [idAula]);

  // registros de quem já assistiu saem junto: sem a aula, não têm sentido
  await pool.query(`DELETE FROM aula_assistida WHERE id_aula = $1`, [idAula]);
  await pool.query(`DELETE FROM aula_anexo     WHERE id_aula = $1`, [idAula]);
  await pool.query(`DELETE FROM aula           WHERE id = $1`, [idAula]);

  try {
    const cred = await credenciaisDoProdutor(pool, auth.idProdutor);
    await excluirVideo(cred, rows[0]?.id_video);
  } catch (err) {
    // o vídeo órfão na Bunny é menos grave que falhar a exclusão da aula
    console.warn('[gestao/aula] vídeo não removido da Bunny:', err.message);
  }

  return res.status(200).json({ result: { error: false } });
}
