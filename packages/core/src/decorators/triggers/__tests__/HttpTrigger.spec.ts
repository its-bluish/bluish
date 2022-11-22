import { HttpContext } from "../../../models/contexts/HttpContext"
import { Runner } from "../../../models/Runner"
import { run } from "../../../test-utils/run"
import { HttpTrigger } from "../HttpTrigger"

describe('HttpTrigger', () => {
  it('.', async () => {
    class HttpTriggerTest {
      @HttpTrigger('/', 'get')
      public run(context: HttpContext) {
        const { authorization } = context.headers

        if (!authorization) throw new Error('Not authorized');        

        const [username, password] = Buffer.from(authorization.replace(/^Basic /, ''), 'base64').toString('utf8').split(':')

        return { username, password }
      }
    }

    await expect(
      run(new Runner(HttpTriggerTest, 'run'), undefined, {
        headers: { 'Authorization': `Basic ${Buffer.from('username:password', 'utf-8').toString('base64')}` }
      })
    ).resolves.toEqual({ username: 'username', password: 'password' })

    await expect(run(new Runner(HttpTriggerTest, 'run'))).rejects.toThrowError('Not authorized')
  })
})
