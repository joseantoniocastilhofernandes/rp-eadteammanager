/**
 * Envio de anexo direto do navegador para o S3, usando a URL assinada que
 * o backend devolve. Igual ao vídeo: o arquivo não passa pela função
 * serverless, que tem limite de corpo e de tempo.
 */

export function enviarArquivo(arquivo, urlEnvio, contentType, aoProgredir) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()

    req.open('PUT', urlEnvio, true)
    req.setRequestHeader('Content-Type', contentType)

    req.upload.onprogress = (e) => {
      if (aoProgredir && e.lengthComputable) {
        aoProgredir(Math.round((e.loaded / e.total) * 100))
      }
    }

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) resolve()
      else reject(new Error(`S3 respondeu ${req.status}`))
    }
    req.onerror = () => reject(new Error('Falha de rede no envio'))

    req.send(arquivo)
  })
}

const EXTENSOES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'jpg', 'jpeg', 'png']

export function extensaoDe(nomeArquivo) {
  const ext = (nomeArquivo.split('.').pop() || '').toLowerCase()

  return ext === 'jpeg' ? 'jpg' : ext
}

export function extensaoPermitida(nomeArquivo) {
  return EXTENSOES.includes(extensaoDe(nomeArquivo))
}

export const ACCEPT_ANEXO = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png'
