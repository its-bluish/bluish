import { Application } from '@bluish/core'
import { InitializeDataSourceMiddleware } from '@bluish/typeorm'

import { database } from '../services/database.js'
import { ValidationErrorMiddleware } from '../middlewares/ValidationErrorMiddleware.js'
import { HttpErrorMiddleware } from '../middlewares/HttpErrorMiddleware.js'
import { EntityNotFoundMiddleware } from '../middlewares/EntityNotFoundMiddleware.js'

export default class App extends Application {
  public readonly use = [
    new InitializeDataSourceMiddleware(database),
    new ValidationErrorMiddleware(),
    new HttpErrorMiddleware(),
    new EntityNotFoundMiddleware(),
  ]
}
