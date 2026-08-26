/**
 * Envio do arquivo direto do navegador para a Bunny.
 *
 * Não passa pelo nosso servidor: função serverless tem limite de corpo e
 * de tempo, e uma aula de 300 MB não caberia. A assinatura vem do backend
 * e vale poucas horas, só para aquele vídeo.
 *
 * Usa TUS, que envia em pedaços e retoma de onde parou se a conexão cair.
 */

const TUS_CDN = 'https://cdn.jsdelivr.net/npm/tus-js-client@4.1.0/dist/tus.min.js'

let carregando = null

/** Carrega a biblioteca TUS uma vez só, sob demanda. */
function carregarTus() {
  if (typeof window === 'undefined') return Promise.reject(new Error('sem window'))
  if (window.tus) return Promise.resolve(window.tus)
  if (carregando) return carregando

  carregando = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TUS_CDN
    script.onload = () => (window.tus ? resolve(window.tus) : reject(new Error('TUS não carregou')))
    script.onerror = () => reject(new Error('TUS não carregou'))
    document.head.appendChild(script)
  })

  return carregando
}

/**
 * @param {File}   arquivo
 * @param {object} upload    o que /gestao/aula devolveu em result.upload
 * @param {object} opcoes    { aoProgredir(percentual), titulo }
 * @returns {Promise<void>}  resolve quando o arquivo terminou de subir
 */
export async function enviarVideo(arquivo, upload, { aoProgredir, titulo } = {}) {
  const tus = await carregarTus()

  return new Promise((resolve, reject) => {
    const envio = new tus.Upload(arquivo, {
      endpoint: upload.endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: upload.assinatura,
        AuthorizationExpire: String(upload.expira),
        VideoId: upload.videoId,
        LibraryId: upload.libraryId,
      },
      metadata: {
        filetype: arquivo.type,
        title: titulo || arquivo.name,
      },
      onError: (err) => reject(err),
      onProgress: (enviado, total) => {
        if (aoProgredir && total) {
          aoProgredir(Math.round((enviado / total) * 100))
        }
      },
      onSuccess: () => resolve(),
    })

    // se houver um envio interrompido do mesmo arquivo, continua dele
    envio.findPreviousUploads().then((anteriores) => {
      if (anteriores.length > 0) envio.resumeFromPreviousUpload(anteriores[0])
      envio.start()
    })
  })
}

/** Rótulo legível para o tamanho do arquivo. */
export function formatarTamanho(bytes) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(0)} MB`

  return `${(mb / 1024).toFixed(1)} GB`
}

/** Duração em segundos para "12min 30s". */
export function formatarDuracao(segundos) {
  if (!segundos) return ''
  const min = Math.floor(segundos / 60)
  const seg = Math.round(segundos % 60)
  if (min < 60) return seg ? `${min}min ${seg}s` : `${min}min`
  const horas = Math.floor(min / 60)

  return `${horas}h ${min % 60}min`
}
