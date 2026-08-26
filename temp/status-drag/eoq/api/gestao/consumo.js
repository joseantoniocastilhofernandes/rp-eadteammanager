import { getPool } from '../lib/db.js';
import { setCors } from '../lib/helpers.js';
import { autorizarGestao } from '../lib/autorizacao.js';
import { trafegoDaPullZone } from '../lib/bunny.js';

/**
 * Consumo de tráfego de vídeo.
 *
 *   GET ?idGestor=...                    mês corrente + limite do plano
 *   GET ?idGestor=...&referencia=2026-07 um mês específico
 *   GET ?idGestor=...&historico=1        os últimos 12 meses fechados
 *
 * O mês corrente é consultado na Bunny em tempo real. Meses fechados vêm
 * de produtor_consumo, porque a Bunny não guarda estatística para sempre
 * e o faturamento precisa de um número que não mude depois.
 */

const GB = 1024 ** 3;

/** Preço médio por GB. Ajuste conforme o contrato com a Bunny. */
const USD_POR_GB = Number(process.env.BUNNY_USD_POR_GB || '0.01');

function primeiroDiaDoMes(referencia) {
  return `${referencia}-01`;
}

function ultimoDiaDoMes(referencia) {
  const [ano, mes] = referencia.split('-').map(Number);
  return new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10);
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ result: { error: true, errorCodes: ['METHOD_NOT_ALLOWED'] } });
  }

  const idGestor = String(req.query.idGestor ?? '').trim();

  const pool = getPool();
  const auth = await autorizarGestao(pool, idGestor);
  if (!auth.ok) return res.status(200).json({ result: { error: true, errorCodes: [auth.erro] } });

  try {
    const { rows } = await pool.query(
      `SELECT p.bunny_pull_zone,
              COALESCE(p.max_gb_mes, pl.max_gb_mes) AS max_gb_mes
         FROM produtor p
         LEFT JOIN plano pl ON pl.id = p.id_plano
        WHERE p.id = $1`,
      [auth.idProdutor]
    );
    const produtor = rows[0] || {};
    const limiteGb = produtor.max_gb_mes;

    // histórico dos meses fechados
    if (req.query.historico) {
      const hist = await pool.query(
        `SELECT referencia,
                bytes_saida  AS "bytes",
                requisicoes,
                custo_usd    AS "custoUsd"
           FROM produtor_consumo
          WHERE id_produtor = $1
          ORDER BY referencia DESC
          LIMIT 12`,
        [auth.idProdutor]
      );
      return res.status(200).json({
        result: {
          error: false,
          limiteGb,
          historico: hist.rows.map((h) => ({
            ...h,
            gb: Number((Number(h.bytes) / GB).toFixed(2)),
          })),
        },
      });
    }

    const referencia = String(req.query.referencia || mesAtual());
    if (!/^\d{4}-\d{2}$/.test(referencia)) {
      return res.status(200).json({ result: { error: true, errorCodes: ['REFERENCIA_INVALIDA'] } });
    }

    // mês fechado: usa o que foi apurado, para o número não mudar depois
    if (referencia < mesAtual()) {
      const { rows: fechado } = await pool.query(
        `SELECT bytes_saida, requisicoes, custo_usd
           FROM produtor_consumo WHERE id_produtor = $1 AND referencia = $2`,
        [auth.idProdutor, referencia]
      );
      if (fechado.length > 0) {
        const bytes = Number(fechado[0].bytes_saida);
        return res.status(200).json({
          result: {
            error: false,
            referencia,
            gb: Number((bytes / GB).toFixed(2)),
            requisicoes: Number(fechado[0].requisicoes),
            custoUsd: fechado[0].custo_usd,
            limiteGb,
            fechado: true,
          },
        });
      }
    }

    // mês corrente (ou fechado ainda não apurado): consulta a Bunny
    const trafego = await trafegoDaPullZone(
      produtor.bunny_pull_zone,
      primeiroDiaDoMes(referencia),
      ultimoDiaDoMes(referencia)
    );

    const gb = Number((trafego.bytes / GB).toFixed(2));

    // apura o mês fechado uma única vez
    if (referencia < mesAtual() && trafego.bytes > 0) {
      await pool.query(
        `INSERT INTO produtor_consumo (id_produtor, referencia, bytes_saida, requisicoes, custo_usd)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_produtor, referencia) DO NOTHING`,
        [auth.idProdutor, referencia, trafego.bytes, trafego.requisicoes, (gb * USD_POR_GB).toFixed(4)]
      );
    }

    return res.status(200).json({
      result: {
        error: false,
        referencia,
        gb,
        requisicoes: trafego.requisicoes,
        custoUsd: Number((gb * USD_POR_GB).toFixed(4)),
        limiteGb,
        percentualUsado: limiteGb ? Math.round((gb / limiteGb) * 100) : null,
        porDia: trafego.porDia,
        fechado: false,
      },
    });
  } catch (err) {
    console.error('[gestao/consumo] erro:', err.message);
    return res.status(500).json({ result: { error: true, errorCodes: ['ERRO_INTERNO'] } });
  }
}
