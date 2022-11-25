import { HttpContext } from '../../../models/contexts/HttpContext'
import { Runner } from '../../../models/Runner'
import { run } from '../../../test-utils/run'
import { Bind } from '../../Bind'
import { HttpTrigger } from '../HttpTrigger'

describe('HttpTrigger', () => {
  it('.', async () => {
    class HttpTriggerTest {
      @HttpTrigger('/', 'get')
      public run(@Bind() context: HttpContext) {
        const { authorization } = context.headers

        if (!authorization) throw new Error('Not authorized')

        const [username, password] = Buffer.from(authorization.replace(/^Basic /, ''), 'base64')
          .toString('utf8')
          .split(':')

        return { username, password }
      }
    }

    await run.http(new Runner(HttpTriggerTest, 'run'), {
      headers: {
        Authorization: `Basic ${Buffer.from('username:password', 'utf-8').toString('base64')}`,
      },
    })

    await expect(
      run.http(new Runner(HttpTriggerTest, 'run'), {
        headers: {
          Authorization: `Basic ${Buffer.from('username:password', 'utf-8').toString('base64')}`,
        },
      }),
    ).resolves.toEqual({
      body: {
        username: 'username',
        password: 'password',
      },
    })

    await expect(run.http(new Runner(HttpTriggerTest, 'run'))).rejects.toThrowError(
      'Not authorized',
    )
  })
})
