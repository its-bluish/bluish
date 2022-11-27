/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpContext } from '../../../models/contexts/HttpContext'
import { Runner } from '../../../models/Runner'
import { run } from '../../../test-utils/run'
import { Bind } from '../../Bind'
import { Http } from '../Http'

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

    await expect(
      run.testing(Testing, void 0, {
        headers: {},
      }),
    ).resolves.toMatchSnapshot()
  })

  describe('.Query', () => {
    it('appends to the first argument taking the entire query object', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query() query: unknown) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          query: { testing: true },
          headers: {},
        },
      )
      expect(testing).toBeCalledWith({ testing: true })
    })

    it('appends to the first argument by selecting the value by name', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query('testing') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          query: { testing: true },
          headers: {},
        },
      )
      expect(testing).toBeCalledWith(true)
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Query((query) => query.testing) testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          query: { testing: true },
          headers: {},
        },
      )
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
      await run.testing(
        Testing,
        {},
        {
          body: { testing: true },
          headers: {},
        },
      )
      expect(testing).toBeCalledWith({ testing: true })
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Body((body) => body === 'true') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          body: 'true',
          headers: {},
        },
      )
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
      await run.testing(
        Testing,
        {},
        {
          params: { testing: true },
          headers: {},
        },
      )
      expect(testing).toBeCalledWith({ testing: true })
    })

    it('appends to the first argument by selecting the value by name', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Param('testing') testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          params: { testing: true },
          headers: {},
        },
      )
      expect(testing).toBeCalledWith(true)
    })

    it('appends to the first argument by selecting the value', async () => {
      class Testing {
        @Http.Get('/')
        public testing(@Http.Param((query) => query.testing) testing: boolean) {}
      }
      const testing = jest.spyOn(Testing.prototype, 'testing')
      await run.testing(
        Testing,
        {},
        {
          params: { testing: true },
          headers: {},
        },
      )
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
      await run.testing(
        Testing,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      expect(testing).toBeCalledWith('application/json')
    })

    it('add a header on the trigger result', async () => {
      class Testing {
        @Http.Get('/')
        @Http.Header('Content-Type', 'application/json')
        public testing() {}
      }
      await expect(run.testing(Testing, {}, { headers: {} })).resolves.toMatchSnapshot()
    })
  })

  describe('.Status', () => {
    it('add a status to the requisition', async () => {
      class Testing {
        @Http.Post('/')
        @Http.Status(201)
        public testing() {}
      }
      await expect(run.testing(Testing, {}, { headers: {} })).resolves.toMatchSnapshot()
    })
  })
})
