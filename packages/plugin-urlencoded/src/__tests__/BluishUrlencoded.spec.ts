import { Http } from '@bluish/core'
import { run } from '@bluish/testing'
import qs from 'qs'
import BluishUrlencoded from '..'

describe('Bluish Urlencoded Plugin', () => {
  it('parses the body as application/x-www-form-urlencoded using qs extended', async () => {
    class Testing {
      @Http.Get('/testing')
      @BluishUrlencoded({ extended: true })
      public testing() {}
    }

    const context = await run.http.get(Testing, 'testing', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: qs.stringify({
        user: {
          name: 'Testing',
          photos: [
            { url: 'http://localhost:8080/testing.png' },
            { url: 'http://localhost:8080/testing.png' },
          ],
        },
      }),
    })

    expect(context.body).toEqual({
      user: {
        name: 'Testing',
        photos: [
          { url: 'http://localhost:8080/testing.png' },
          { url: 'http://localhost:8080/testing.png' },
        ],
      },
    })
  })

  it('parse the query as qs extended', async () => {
    class Testing {
      @Http.Get('/testing')
      @BluishUrlencoded({ extended: true })
      public testing() {}
    }

    const context = await run.http.get(Testing, 'testing', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      query: qs.stringify({
        user: {
          name: 'Testing',
          photos: [
            { url: 'http://localhost:8080/testing.png' },
            { url: 'http://localhost:8080/testing.png' },
          ],
        },
      }),
    })

    expect(context.query).toEqual({
      user: {
        name: 'Testing',
        photos: [
          { url: 'http://localhost:8080/testing.png' },
          { url: 'http://localhost:8080/testing.png' },
        ],
      },
    })
  })

  it('parse the query as qs no extended', async () => {
    class Testing {
      @Http.Get('/testing')
      @BluishUrlencoded({ extended: true })
      public testing() {}
    }

    const context = await run.http.get(Testing, 'testing', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      query: qs.stringify({
        user: {
          name: 'Testing',
          photos: [
            { url: 'http://localhost:8080/testing.png' },
            { url: 'http://localhost:8080/testing.png' },
          ],
        },
      }),
    })

    expect(context.query).toEqual({
      'user[name]': 'Testing',
      'user[photos][0][url]': 'http://localhost:8080/testing.png',
      'user[photos][1][url]': 'http://localhost:8080/testing.png',
    })
  })
})
