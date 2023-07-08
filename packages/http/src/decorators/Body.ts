import { Selector } from '@bluish/core'

import { HttpContext } from '../models/HttpContext.js'

export const Body = Selector(HttpContext, context => context.request.body)
