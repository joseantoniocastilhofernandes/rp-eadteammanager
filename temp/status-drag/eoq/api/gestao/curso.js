import { getPool } from '../lib/db.js';
import { setCors } from '../lib/helpers.js';
import { autorizarGestao, podeEditarConteudo, cursoEhDoProdutor } from '../lib/autorizacao.js';
import { criarColecao, renomearColecao, credenciaisDoProdutor } from '../lib/bunny.js';

/**
 * Cursos do produtor.
 *
 *   GET    ?idGestor=...                 lista com contagem de módulos e aulas
 *   GET    ?idGestor=...&idCurso=...     estrutura completa (módulos + aulas)
 *   POST   {idGestor, nome, sobre}       cria (e abre a coleção na Bunny)
 *   PUT    {idGestor, idCurso, ...}      edita
 *   DELETE ?idGestor=...&idCurso=...     inativa (nunca apaga)
 */

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const idGestor = String(req.query.idGestor ?? req.body?.idGestor ?? '').trim();

  const pool = getPool();
  const auth = await autorizarGestao(pool, idGestor);
  if (!auth.ok) {
    return res.status(200).json({ result: { error: true, errorCodes: [auth.erro] } });
  }

  try {
    if (req.method === 'GET') return await listar(pool, auth, req, res);

    if (!podeEditarConteudo(auth)) {
      return res.status(200).json({ result: { error: true, errorCodes: ['SEM_PERMISSAO'] } });
    }

    if (req.method === 'POST')   return await criar(pool, auth, idGestor, req, res);
    if (req.method === 'PUT')    return await editar(pool, auth, req, res);
    if (req.method === 'DELETE') return await inativar(pool, auth, req, res);

    return res.status(405).json({ result: { error: true, errorCodes: ['METHOD_NOT_ALLOWED'] } });
  } catch (err) {
    console.error('[gestao/curso] erro:', err.message);
    return res.status(500).json({ result: { error: true, errorCodes: ['ERRO_INTERNO'] } });
  }
}

// ── GET ────────────────────────────────────────────────────────────────
async function listar(pool, auth, req, res) {
  const idCurso = req.query.idCurso;

  // estrutura completa de um curso
  if (idCurso) {
    if (!(await cursoEhDoProdutor(pool, idCurso, auth.idProdutor))) {
      return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_NAO_ENCONTRADO'] } });
    }

    const curso = await pool.query(
      `SELECT c.id, c.nome, c.sobre, c.status,
              c.bunny_collection_id                 AS "colecaoBunny",
              cp.liberavel_por_lider                AS "liberavelPorLider",
              cp.liberacao_automatica               AS "liberacaoAutomatica",
              cp.ordem
         FROM curso c
         JOIN curso_produtor cp ON cp.id_curso = c.id
        WHERE c.id = $1 AND cp.id_produtor = $2`,
      [idCurso, auth.idProdutor]
    );

    const modulos = await pool.query(
      `SELECT m.id, m.nome, m.ordem,
              m.id_status_modulo                    AS "idStatus",
              m.dh_prevista_de_liberacao            AS "dhLiberacao",
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',              a.id,
                    'nome',            a.nome,
                    'ordem',           a.ordem,
                    'idTipoAula',      a.id_tipo_aula,
                    'idVideo',         a.id_video,
                    'statusVideo',     a.status_video,
                    'duracaoSegundos', a.duracao_segundos
                  ) ORDER BY a.ordem
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'
              )                                     AS aulas,
              (SELECT count(*) FROM prova p WHERE p.id_modulo = m.id AND p.ativo) AS "temProva"
         FROM modulo m
         LEFT JOIN aula a ON a.id_modulo = m.id
        WHERE m.id_curso = $1 AND m.id_status_modulo <> 3
        GROUP BY m.id
        ORDER BY m.ordem`,
      [idCurso]
    );

    return res.status(200).json({
      result: { error: false, curso: curso.rows[0], modulos: modulos.rows },
    });
  }

  // lista resumida
  const cursos = await pool.query(
    `SELECT c.id, c.nome, c.sobre, c.status,
            cp.liberavel_por_lider  AS "liberavelPorLider",
            cp.liberacao_automatica AS "liberacaoAutomatica",
            cp.ordem,
            (SELECT count(*) FROM modulo m
              WHERE m.id_curso = c.id AND m.id_status_modulo <> 3) AS "qtdModulos",
            (SELECT count(*) FROM modulo m
              WHERE m.id_curso = c.id AND m.id_status_modulo = 1) AS "qtdModulosPublicados",
            (SELECT count(*) FROM aula a
               JOIN modulo m ON m.id = a.id_modulo
              WHERE m.id_curso = c.id AND m.id_status_modulo <> 3) AS "qtdAulas",
            (SELECT count(DISTINCT ca.id_usuario) FROM curso_aluno ca
              WHERE ca.id_curso = c.id AND ca.id_status_meu_curso = 2) AS "qtdAlunos"
       FROM curso c
       JOIN curso_produtor cp ON cp.id_curso = c.id
      WHERE cp.id_produtor = $1 AND c.status <> 'excluido'
      ORDER BY cp.ordem NULLS LAST, c.nome`,
    [auth.idProdutor]
  );

  return res.status(200).json({ result: { error: false, cursos: cursos.rows } });
}

// ── POST ───────────────────────────────────────────────────────────────
async function criar(pool, auth, idGestor, req, res) {
  const { nome, sobre } = req.body || {};
  if (!nome || !nome.trim()) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }

  // a coleção nasce antes da transação: se a Bunny falhar, nada é gravado
  let colecao = null;
  try {
    const cred = await credenciaisDoProdutor(pool, auth.idProdutor);
    colecao = await criarColecao(cred, nome.trim());
  } catch (err) {
    if (err.message === 'SEM_BIBLIOTECA') {
      return res.status(200).json({ result: { error: true, errorCodes: ['SEM_BIBLIOTECA'] } });
    }
    console.error('[gestao/curso] Bunny indisponível:', err.message);
    return res.status(200).json({ result: { error: true, errorCodes: ['BUNNY_INDISPONIVEL'] } });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const curso = await client.query(
      `INSERT INTO curso (id, nome, sobre, status, cadastrado_por,
                          bunny_collection_id, dh_cadastro, dh_ultima_alteracao)
       VALUES (gen_random_uuid(), $1, $2, 'rascunho', $3, $4, NOW(), NOW())
       RETURNING id`,
      [nome.trim(), (sobre || '').trim(), idGestor, colecao]
    );
    const idCurso = curso.rows[0].id;

    await client.query(
      `INSERT INTO curso_produtor (id_curso, id_produtor, ordem)
       VALUES ($1, $2, (SELECT COALESCE(max(ordem), 0) + 1
                          FROM curso_produtor WHERE id_produtor = $2))`,
      [idCurso, auth.idProdutor]
    );

    await client.query('COMMIT');
    return res.status(200).json({ result: { error: false, idCurso } });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── PUT ────────────────────────────────────────────────────────────────
async function editar(pool, auth, req, res) {
  const { idCurso, nome, sobre, status, liberavelPorLider, liberacaoAutomatica } = req.body || {};

  if (!idCurso) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await cursoEhDoProdutor(pool, idCurso, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_NAO_ENCONTRADO'] } });
  }

  if (nome && nome.trim()) {
    await pool.query(
      `UPDATE curso SET nome = $2, sobre = COALESCE($3, sobre), dh_ultima_alteracao = NOW()
        WHERE id = $1`,
      [idCurso, nome.trim(), sobre?.trim() ?? null]
    );

    // mantém o nome da coleção alinhado, para achar os vídeos no painel da Bunny
    const { rows } = await pool.query(
      `SELECT bunny_collection_id FROM curso WHERE id = $1`, [idCurso]
    );
    try {
      const cred = await credenciaisDoProdutor(pool, auth.idProdutor);
      await renomearColecao(cred, rows[0]?.bunny_collection_id, nome.trim());
    } catch (err) {
      console.warn('[gestao/curso] não renomeou a coleção:', err.message);
    }
  }

  if (status) {
    if (!['rascunho', 'publicado'].includes(status)) {
      return res.status(200).json({ result: { error: true, errorCodes: ['STATUS_INVALIDO'] } });
    }
    // publicar um curso sem aula deixaria o aluno numa tela vazia
    if (status === 'publicado') {
      const { rows } = await pool.query(
        `SELECT count(*) AS qtd
           FROM aula a
           JOIN modulo m ON m.id = a.id_modulo
          WHERE m.id_curso = $1 AND m.id_status_modulo = 1`,
        [idCurso]
      );
      if (Number(rows[0].qtd) === 0) {
        return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_SEM_AULA_PUBLICADA'] } });
      }
    }
    await pool.query(
      `UPDATE curso SET status = $2, dh_ultima_alteracao = NOW() WHERE id = $1`,
      [idCurso, status]
    );
  }

  if (liberavelPorLider !== undefined || liberacaoAutomatica !== undefined) {
    await pool.query(
      `UPDATE curso_produtor
          SET liberavel_por_lider  = COALESCE($3, liberavel_por_lider),
              liberacao_automatica = COALESCE($4, liberacao_automatica)
        WHERE id_curso = $1 AND id_produtor = $2`,
      [idCurso, auth.idProdutor, liberavelPorLider ?? null, liberacaoAutomatica ?? null]
    );
  }

  return res.status(200).json({ result: { error: false } });
}

// ── DELETE ─────────────────────────────────────────────────────────────
async function inativar(pool, auth, req, res) {
  const idCurso = req.query.idCurso ?? req.body?.idCurso;

  if (!idCurso) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CAMPOS_OBRIGATORIOS'] } });
  }
  if (!(await cursoEhDoProdutor(pool, idCurso, auth.idProdutor))) {
    return res.status(200).json({ result: { error: true, errorCodes: ['CURSO_NAO_ENCONTRADO'] } });
  }

  // nunca apaga: há progresso de aluno amarrado ao curso
  await pool.query(
    `UPDATE curso SET status = 'excluido', dh_ultima_alteracao = NOW() WHERE id = $1`,
    [idCurso]
  );
  await pool.query(
    `UPDATE curso_produtor SET liberacao_automatica = false, liberavel_por_lider = false
      WHERE id_curso = $1 AND id_produtor = $2`,
    [idCurso, auth.idProdutor]
  );

  return res.status(200).json({ result: { error: false } });
}
