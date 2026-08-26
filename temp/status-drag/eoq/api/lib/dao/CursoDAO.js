import { getPool } from '../db.js';

const CursoDAO = {
  async listarCursosCompradosDoAluno(idUsuario) {
    const pool = getPool();
    const sql = `
      SELECT
        curso.id,
        curso.nome,
        curso.sobre,
        curso.dh_cadastro,
        curso.dh_ultima_alteracao,
        curso_aluno.dh_compra,
        curso_aluno.dh_expiracao,
        curso_aluno.id_status_meu_curso,
        status_meu_curso.nome as nome_status_curso,
        curso_produtor.id_produtor,
        produtor.nome_comercial,
        produtor.api_key
      FROM curso
        JOIN curso_aluno ON (curso.id = curso_aluno.id_curso AND curso_aluno.id_usuario = $1)
        JOIN status_meu_curso ON (curso_aluno.id_status_meu_curso = status_meu_curso.id)
        LEFT JOIN curso_produtor ON (curso_produtor.id_curso = curso.id)
        LEFT JOIN produtor ON (curso_produtor.id_produtor = produtor.id)
      WHERE curso_aluno.id_status_meu_curso = 2
        AND curso.status = 'publicado'
      ORDER BY curso.nome ASC
    `;
    const { rows } = await pool.query(sql, [idUsuario]);

    const cursosMap = {};
    const result = [];

    for (const row of rows) {
      const idCurso = row.id;
      if (!cursosMap[idCurso]) {
        const curso = {
          id: idCurso,
          nome: row.nome,
          sobre: row.sobre,
          dhCadastro: row.dh_cadastro,
          dhUltimaAlteracao: row.dh_ultima_alteracao,
          produtores: [],
          nomeDosProdutores: '',
        };
        if (row.id_produtor) {
          curso.produtores.push({
            id: row.id_produtor,
            nomeComercial: row.nome_comercial,
            apiKey: row.api_key,
          });
        }
        const meuCurso = {
          curso,
          dhCompra: row.dh_compra,
          dhExpiracao: row.dh_expiracao,
          status: { id: row.id_status_meu_curso, nome: row.nome_status_curso },
        };
        cursosMap[idCurso] = curso;
        result.push(meuCurso);
      } else {
        if (row.id_produtor) {
          cursosMap[idCurso].produtores.push({
            id: row.id_produtor,
            nomeComercial: row.nome_comercial,
            apiKey: row.api_key,
          });
        }
      }
    }

    // Formatar nomes dos produtores
    for (const meuCurso of result) {
      const nomes = meuCurso.curso.produtores.map(p => p.nomeComercial).filter(Boolean);
      meuCurso.curso.nomeDosProdutores = nomes.join(', ');
    }

    return result;
  },

  async getNomeDoCurso(idCurso) {
    const pool = getPool();
    const { rows } = await pool.query('SELECT nome FROM curso WHERE id = $1', [idCurso]);
    return rows[0]?.nome || '';
  },
};

export default CursoDAO;
