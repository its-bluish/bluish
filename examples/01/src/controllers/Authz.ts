import { Body, POST, Path } from '@bluish/http'
import { Cron } from '@bluish/cron'

@Path('/authz')
export class Authz {
  @POST('/token')
  public token(@Body body: any) {
    console.log(body)
  }

  @Cron('*/10 * * * * *')
  public ping() {
    console.log('Ping every 10 second')
  }
}
