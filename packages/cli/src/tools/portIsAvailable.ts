import net from 'net'

export async function portIsAvailable(port: number, hostname?: string) {
  const server = net.createServer()

  return new Promise<boolean>((resolve) => {
    server.once('error', (err) => {
      if (!('code' in err)) return void 0
      if (err.code === 'EADDRINUSE') resolve(false)
      if (err.code === 'ENOTFOUND') resolve(true)
      return void 0
    })

    server.once('listening', () => {
      server.close(() => {
        resolve(true)
      })
    })

    server.listen(port, hostname)
  })
}
