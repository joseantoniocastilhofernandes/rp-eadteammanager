import { getPool } from '../lib/db.js';
import { setCors } from '../lib/helpers.js';
import { autorizarGestao, podeEditarConteudo, cursoEhDoProdutor, moduloEhDoProdutor } from '../lib/autorizacao.js';

/**
 * Módulos de um curso.
 *
 *   POST   {idGestor, idCurso, nome}          cria no fim da lista
 *   PUT    {idGestor, idModulo, nome, ...}    edita
 *   PUT    {idGestor, idCurso, ordem: [...]}  reordena (arrastar e soltar)
 *   DELETE ?idGestor=...&idModulo=...         marca como excluído (status 3)
 */

const STATUS_LIBERADO = 1;
const STATUS_EXCLUIDO = 3;
const STATUS_RASCUNHO = 4;

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
    if (req.method === 'POST')   return await criar(pool, auth, req, res);
    if (req.method === 'PUT')    return await atualizar(pool, auth, req, res);
    if (req.method === 'DELETE') return await excluir(pool, auth, req, res);
    return res.status(405).json({ result: { error: true, errorCodes: ['METHOD_NOT_ALLOWED'] } });
  } catch (err) {
    console.error('[gestao/modulo] erro:', err.message);
    return res.status(500).json({ result: { error: true, errorCodes: ['ERRO_INTERNO'] } });
  }
}

async function criar(pool, auth, req, res) {
  const { idCurso, nome } = req.body || {};
  if (!idCurso || !nome?.trim()) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await cursoEhDoProdutor(pool, idCurso, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_NAO_ENCONTRADO'] } });
  }

  const { rows } = await pool.query(
    `INSERT INTO modulo (id_curso, nome, ordem, id_status_modulo, dh_cadastro, dh_ultima_alteracao)
     VALUES ($1, $2,
             (SELECT COALESCE(max(ordem), 0) + 1 FROM modulo WHERE id_curso = $1),
             $3, NOW(), NOW())
     RETURNING id, ordem`,
    [idCurso, nome.trim(), STATUS_RASCUNHO]
  );

  return res.status(200).json({
    result: { error: false, idModulo: rows[0].id, ordem: rows[0].ordem, idStatus: STATUS_RASCUNHO },
  });
}

async function atualizar(pool, auth, req, res) {
  const { idModulo, idCurso, nome, idStatus, dhLiberacao, ordem } = req.body || {};

  // reordenação em lote: recebe a lista de ids na ordem desejada
  if (Array.isArray(ordem) && idCurso) {
    if (!(await cursoEhDoProdutor(pool, idCurso, auth.idProdutor))) {
      return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_NAO_ENCONTRADO'] } });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE modulo m SET ordem = n.pos, dh_ultima_alteracao = NOW()
           FROM unnest($2::bigint[]) WITH ORDINALITY AS n(id, pos)
          WHERE m.id = n.id AND m.id_curso = $1`,
        [idCurso, ordem]
      );
      await client.query('COMMIT');
      return res.status(200).json({ result: { error: false } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  if (!idModulo) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await moduloEhDoProdutor(pool, idModulo, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['MODULO_NAO_ENCONTRADO'] } });
  }

  if (idStatus === STATUS_LIBERADO) {
    const { rows } = await pool.query(
      `SELECT count(*) AS qtd FROM aula
        WHERE id_modulo = $1 AND status_video = 'pronto'`,
      [idModulo]
    );
    if (Number(rows[0].qtd) === 0) {
      return res.status(200).json({ result: { error: true, errorCodes: ['MODULO_SEM_AULA_PRONTA'] } });
    }
  }

  await pool.query(
    `UPDATE modulo
        SET nome                     = COALESCE($2, nome),
            id_status_modulo         = COALESCE($3, id_status_modulo),
            dh_prevista_de_liberacao = COALESCE($4, dh_prevista_de_liberacao),
            dh_ultima_alteracao      = NOW()
      WHERE id = $1`,
    [idModulo, nome?.trim() ?? null, idStatus ?? null, dhLiberacao ?? null]
  );

  return res.status(200).json({ result: { error: false } });
}

async function excluir(pool, auth, req, res) {
  const idModulo = req.query.idModulo ?? req.body?.idModulo;
  if (!idModulo) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await moduloEhDoProdutor(pool, idModulo, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['MODULO_NAO_ENCONTRADO'] } });
  }

  // status 3 = Excluido. Não apaga: há aula_assistida e provas apontando para cá.
  await pool.query(
    `UPDATE modulo SET id_status_modulo = $2, dh_ultima_alteracao = NOW() WHERE id = $1`,
    [idModulo, STATUS_EXCLUIDO]
  );

  return res.status(200).json({ result: { error: false } });
}
