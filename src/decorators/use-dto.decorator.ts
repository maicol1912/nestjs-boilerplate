import type { Constructor } from '../types.ts';

export function UseDto(dtoClass: Constructor): ClassDecorator {
  return (ctor) => {
    // NOTE make dtoClass function returning dto

    if (!(dtoClass as unknown)) {
      throw new Error('UseDto decorator requires dtoClass');
    }

    ctor.prototype.dtoClass = dtoClass;
  };
}
