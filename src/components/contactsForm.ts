import { Form } from './common/form';
import { IOrder } from '../types';
import { IEvents } from './base/events';

export class ContactsForm extends Form<IOrder> {
	protected _inputPhone: HTMLInputElement;
	protected _inputEmail: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._inputPhone = container.querySelector<HTMLInputElement>('input[name="phone"]');
		this._inputEmail = container.querySelector<HTMLInputElement>('input[name="email"]');
	}

	set phone(value: string) {
		if (this._inputPhone) {
			this._inputPhone.value = value;
		}
	}

	set email(value: string) {
		if (this._inputEmail) {
			this._inputEmail.value = value;
		}
	}
}