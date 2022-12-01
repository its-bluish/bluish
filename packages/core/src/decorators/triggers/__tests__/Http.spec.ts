/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpContext } from '../../../models/contexts/HttpContext'
import { Runner } from '../../../models/Runner'
import { Bind } from '../../Bind'
import { Http } from '../Http'
import { run } from '@bluish/testing'

describe('Http', () => {
  it.each([
    'Get',
    'Post',
    'Patch',
    'Put',
    'Delete',
    'Head',
    'Options',
    'Trace',
    'Connect',
  ] as const)('create a trigger with %s', async (method) => {
    const MethodDecorator: typeof Http.Get = Http[method]
    class Testing {
      @MethodDecorator('/')
      public testing() {
        return method
      }
    }

    const { response } = await run.http[method.toLowerCase() as Lowercase<typeof method>](
      Testing,
      'testing',
    )

    expect(response).toEqual({
      status: 200,
      headers: {},
      body: method,
    })
  })

  describe('.Query', () => {
    it('appends to the first argument taking the entire query object', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query() query: unknown) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')

      await run.http.get(Testing, 'testing', {
        query: { testing: true },
      })

      expect(testing).toBeCalledWith({ testing: true })
    })

    it('appends to the first argument by selecting the value by name', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query('testing') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.http.get(Testing, 'testing', {
        query: { testing: true },
      })
      expect(testing).toBeCalledWith(true)
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query((query) => query.testing) testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.http.get(Testing, 'testing', {
        query: { testing: true },
      })
      expect(testing).toBeCalledWith(true)
    })
  })

  describe('.Body', () => {
    it('appends to the first argument taking the entire query object', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Body() body: unknown) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.http.get(Testing, 'testing', { body: { testing: true } })
      expect(testing).toBeCalledWith({ testing: true })
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Body((body) => body === 'true') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.http.get(Testing, 'testing', { body: 'true' })
      expect(testing).toBeCalledWith(true)
    })
  })

  describe('.Param', () => {
    it('appends to the first argument taking the entire query object', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Param() query: unknown) {}
      }

      const testing = jest.spyOn(Testing.prototype, 'testing')

      await run.http.get(Testing, 'testing', { params: { testing: 'true' } })

      expect(testing).toBeCalledWith({ testing: 'true' })
    })

    it('appends to the first argument by selecting the value by name', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Param('testing') testing: 'true') {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')

      await run.http.get(Testing, 'testing', { params: { testing: 'true' } })

      expect(testing).toBeCalledWith('true')
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Param((query) => query.testing === 'true') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')

      await run.http.get(Testing, 'testing', { params: { testing: 'true' } })

      expect(testing).toBeCalledWith(true)
    })
  })

  describe('.Header', () => {
    it('appends to the first argument of getting the header value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Header('Content-Type') contentType: string) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')

      await run.http.get(Testing, 'testing', { headers: { 'Content-Type': 'application/json' } })

      expect(testing).toBeCalledWith('application/json')
    })

    it('add a header on the trigger result', async () => {
      class Testing {
        @Http.Get('/')
        @Http.Header('Content-Type', 'application/json')
        public testing() {}
      }
      const { response } = await run.http.get(Testing, 'testing')

      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
      })
    })
  })

  describe('.Status', () => {
    it('add a status to the requisition', async () => {
      class Testing {
        @Http.Post('/')
        @Http.Status(201)
        public testing() {}
      }

      const { response } = await run.http.post(Testing, 'testing', { headers: {} })

      expect(response.status).toEqual(201)
    })
  })
})
