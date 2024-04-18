import { Api } from './base/api';
import {
	ILarekApi,
	IProducts,
	IOrderResult,
	IProduct,
	IOrder,
} from '../types/index';

export default class LarekApi extends Api implements ILarekApi {
	constructor(baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
	}

	async getProducts(): Promise<IProducts> {
		return (await this.get('/product/')) as IProducts;
	}

	async getProduct(id: string): Promise<IProduct> {
		return (await this.get(`/product/${id}`)) as IProduct;
	}

	async createOrder(order: IOrder): Promise<IOrderResult> {
		return (await this.post('/order', order)) as IOrderResult;
	}
}