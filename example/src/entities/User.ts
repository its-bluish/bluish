import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['id', 'email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string

  @Column({ unique: true })
  public email!: string

  @Column()
  public nickname!: string

  @Column()
  public firstName!: string

  @Column()
  public lastName!: string

  @Column({ unique: true })
  public username!: string

  @Column()
  public password!: string

  @CreateDateColumn()
  public createdAt!: Date

  @UpdateDateColumn()
  public updatedAt!: Date

  @DeleteDateColumn()
  public deletedAt!: Date | null

  constructor() {
    super()

    Object.defineProperty(this, 'password', { enumerable: false })
  }
}
