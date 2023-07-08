import { IsInt, Max, Min } from 'class-validator'

export class Pagination {
  @IsInt()
  @Min(1)
  @Max(50)
  public readonly take: number = 20

  @IsInt()
  @Min(1)
  public readonly page: number = 1
}
