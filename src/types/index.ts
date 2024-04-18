export type FormErrors = {
	email?: string;
	phone?: string;
	address?: string;
	payment?: string;
};

export enum ItemCategory {
	SoftSkill = 'soft',
	HardSkill = 'hard',
	Button = 'button',
	Other = 'other',
	Additional = 'additional',
}

export interface IOrderResult {
	id: string[];
	total: number;
	error?: string;
}

export interface IProducts {
	total: number;
	items: IProduct[];
}

export interface IOrder {
	payment: string | null;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface IProduct {
	id: string;
	title: string;
	price: number;
	description: string;
	image: string;
	category: string;
	status: boolean;
}

export interface IAppState {
	basket: Set<string>;
	catalog: IProduct[];
	order: IOrder;
	preview: string | null;
}

export interface ILarekApi {
	getProducts: () => Promise<IProducts>;
	getProduct: (id: string) => Promise<IProduct>;
	createOrder: (order: IOrder) => Promise<IOrderResult>;
}

export enum Events {
	ITEMS_CHANGED = 'items:changed',
	ADD_PRODUCT = 'cart:add-product',
	REMOVE_PRODUCT = 'cart:remove-product',
	CREATE_ORDER = 'cart:create-order',
	BASKET_OPEN = 'cart:open',
	OPEN_PREVIEW = 'product:open-preview',
	CHANGED_PREVIEW = 'product:changed-preview',
	FORM_ERRORS_CHANGE = 'form:errors-changed',
	ORDER_OPEN = 'order:open',
	ORDER_CLEAR = 'order:clear',
	SET_PAYMENT_METHOD = 'order:set-payment-method',
	MODAL_OPEN = 'modal:open',
	MODAL_CLOSE = 'modal:close'
}

