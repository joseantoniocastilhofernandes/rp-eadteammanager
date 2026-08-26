import { getPool } from '../lib/db.js';
import { setCors } from '../lib/helpers.js';
import { autorizarGestao, podeEditarConteudo } from '../lib/autorizacao.js';
import { criarBiblioteca, definirLimiteDeBanda } from '../lib/bunny.js';

/**
 * Biblioteca de vídeo do produtor.
 *
 *   GET  ?idGestor=...   informa se já existe
 *   POST {idGestor}      cria (uma vez só, no primeiro uso)
 *
 * Cada produtor tem a própria biblioteca Bunny, com a própria AccessKey.
 * O vazamento de uma chave não expõe o conteúdo dos outros clientes.
 */

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const idGestor = String(req.query.idGestor ?? req.body?.idGestor ?? '').trim();

  const pool = getPool();
  const auth = await autorizarGestao(pool, idGestor);
  if (!auth.ok) return res.status(200).json({ result: { error: true, errorCodes: [auth.erro] } });

  try {
    const { rows } = await pool.query(
      `SELECT p.nome_comercial, p.bunny_library_id,
              COALESCE(p.max_gb_mes, pl.max_gb_mes) AS max_gb_mes
         FROM produtor p
         LEFT JOIN plano pl ON pl.id = p.id_plano
        WHERE p.id = $1`,
      [auth.idProdutor]
    );
    const produtor = rows[0];

    if (req.method === 'GET') {
      return res.status(200).json({
        result: { error: false, temBiblioteca: !!produtor?.bunny_library_id },
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ result: { error: true, errorCodes: ['METHOD_NOT_ALLOWED'] } });
    }
    if (!podeEditarConteudo(auth) || auth.papel !== 'admin') {
      return res.status(200).json({ result: { error: true, errorCodes: ['SEM_PERMISSAO'] } });
    }

    // criar duas vezes deixaria vídeos órfãos numa biblioteca esquecida
    if (produtor?.bunny_library_id) {
      return res.status(200).json({ result: { error: false, jaExistia: true } });
    }

    const lib = await criarBiblioteca(produtor.nome_comercial);

    await pool.query(
      `UPDATE produtor
          SET bunny_library_id = $2, bunny_api_key_enc = $3, bunny_pull_zone = $4
        WHERE id = $1 AND bunny_library_id IS NULL`,
      [auth.idProdutor, lib.libraryId, lib.apiKeyCifrada, lib.pullZone]
    );

    // teto de tráfego do plano direto na pull zone: estourou, a Bunny para
    // de servir. Vira limite automático em vez de surpresa na fatura.
    if (produtor.max_gb_mes && lib.pullZone) {
      try {
        await definirLimiteDeBanda(lib.pullZone, produtor.max_gb_mes);
      } catch (err) {
        console.warn('[gestao/biblioteca] limite de banda não aplicado:', err.message);
      }
    }

    console.info(`[gestao/biblioteca] biblioteca ${lib.libraryId} criada para o produtor ${auth.idProdutor}`);
    return res.status(200).json({ result: { error: false, libraryId: lib.libraryId } });
  } catch (err) {
    console.error('[gestao/biblioteca] erro:', err.message);
    return res.status(500).json({ result: { error: true, errorCodes: ['ERRO_INTERNO'] } });
  }
}
