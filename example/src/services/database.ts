import { DataSource } from "typeorm";
import { User } from "../entities/User";

export const database = new DataSource({
  type: 'postgres',
  url: 'postgres://root:root@127.0.0.1:5432/root',
  entities: [
    User
  ],
  synchronize: true
})
