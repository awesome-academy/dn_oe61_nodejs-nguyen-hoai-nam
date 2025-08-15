import { Type } from "@nestjs/common";

export interface ModuleOpts<C, S extends object> {
  controller: Type<C>;
  service: Type<S>;
  serviceMethods: (keyof S)[];
}
