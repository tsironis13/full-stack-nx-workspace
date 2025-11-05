import { core } from '../../../core/public-api';

export const test = {
  id: 10,
  name: 'Product 1',
};

export class Products {
  constructor() {
    console.log(core);
  }
}
