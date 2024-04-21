import { Model } from './base/model';
import { FormErrors, IOrder, IProduct, IAppState, Events } from '../types';

export type CatalogChangeEvent = {
	catalog: IProduct[];
};

export class AppState extends Model<IAppState> {
	basket: Set<string> = new Set();
	catalog: IProduct[] = [];
	order: IOrder = {
		email: '',
		phone: '',
		payment: null,
		address: '',
		total: 0,
		items: [],
	};
	preview: string | null;
	formErrors: FormErrors = {};

	addItemInBasket(item: IProduct) {
		if (!this.basket.has(item.id)) {
			this.basket.add(item.id);
			this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
		}
	}

	removeItemFromBasket(item: IProduct) {
		if (this.basket.has(item.id)) {
			this.basket.delete(item.id);
			this.emitChanges(Events.BASKET_OPEN, { catalog: this.catalog });
			this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
		}
	}


	getBasket() {
		return this.catalog.filter(item => this.basket.has(item.id));
	}

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.emitChanges('product:changed-preview', item);
	}

	setCatalog(data: { items: IProduct[]; total: number }) {
		const { items } = data;
		this.catalog = [...items];
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	getTotalPrice() {
		return Array.from(this.basket).reduce((acc, itemId) => {
			const item = this.catalog.find(item => item.id === itemId);
			return item ? acc + item.price : acc;
		}, 0);
	}

	clearBasket() {
		this.basket.clear();
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	clearOrder() {
		this.order = {
			payment: null,
			address: '',
			email: '',
			phone: '',
			total: 0,
			items: [],
		};
	}

	setOrderField(field: keyof Omit<IOrder, 'items' | 'total'>, value: string) {
		this.order[field] = value;
		if (this.validateOrder(field)) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(field: keyof IOrder) {
		const errors: Partial<Record<keyof IOrder, string>> = {};

		// Проверка для полей email и phone
		if (field === 'email' || field === 'phone') {
			const emailError = !this.order.email.match(/^\S+@\S+\.\S+$/)
				? 'email'
				: '';
			const phoneError = !this.order.phone.match(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$|^8\d{10}$/)
				? 'телефон'
				: '';

			if (emailError && phoneError) {
				errors.email = `Необходимо указать ${emailError} и ${phoneError}`;
			} else if (emailError) {
				errors.email = `Необходимо указать ${emailError}`;
			} else if (phoneError) {
				errors.phone = `Необходимо указать ${phoneError}`;
			}
		} else if (!this.order.address) errors.address = 'Необходимо указать адрес';
		else if (!this.order.payment)
			errors.address = 'Необходимо выбрать тип оплаты';

		this.formErrors = errors;
		this.events.emit(Events.FORM_ERRORS_CHANGE, this.formErrors);
		return Object.keys(errors).length === 0;
	}
}