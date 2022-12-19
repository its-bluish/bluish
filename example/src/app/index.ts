import { App, Use, OnInitialize, Context, OnDestroy, OnError } from "@bluish/core";
import { database } from "../services/database";
import * as Yup from 'yup'
import BluishUrlencodedPlugin from '@bluish/plugin-urlencoded'
import { isHttpError } from 'http-errors'

@App({
  http: { prefix: '' },
  signalr: 'Endpoint=https://testing-signal-r-2.service.signalr.net;AccessKey=h7xYJgp8GjJhuBZMEyHYitrOaj/dKQSS6xuKTUsm7pM=;Version=1.0;' 
})
@Use(new BluishUrlencodedPlugin({ extended: true }))
class Application {
  @OnInitialize()
  public async onInitialize(context: Context) {
    if (!database.isInitialized) await database.initialize()
  }

  @OnDestroy()
  public async onDestroy(context: Context) {}

  @OnError()
  public onError(error: unknown, context: Context) {
    if (typeof error !== 'object') return void 0

    if (error instanceof Yup.ValidationError)

      return {
        status: 400,
        body: { errors: error.inner }
      }

    if (isHttpError(error))

      return { status: error.status, body: { message: error.message } }

    if (!(error instanceof Error)) return void 0

    return { status: 500, body: { message: error.message } }
  }
}

export default Application
