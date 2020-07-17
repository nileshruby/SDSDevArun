import {ProductContext} from '@entities/models';

export class UserContext {
  public readonly CLASSNAME = 'UserContext';

  public isAuthenticated: boolean;
  public userId: number;
  public username: string;
  public isSysAdmin: boolean;
  public isJHAUser?: boolean;
  public assginedProducts: ProductContext[];

  constructor() {
    this.assginedProducts = [];
  }

  public isAuthorized(productId: number): boolean {
    return (this.assginedProducts.findIndex((p: ProductContext) => {
      return p.productId === productId;
    }) >= 0);
  }

  public isProductEnabled(productId: number) {
    return (this.assginedProducts.findIndex((p: ProductContext) => {
      return p.productId === productId && p.isOffered;
    }) >= 0);
  }

  public getProductContextDetails(productId: number): ProductContext {
    return this.assginedProducts.find((p: ProductContext) => {
      return p.productId === productId;
    });
  }
}
