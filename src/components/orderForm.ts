import { Form } from './common/form';
import { Events, IOrder } from '../types';
import { IEvents } from './base/events';

export class OrderForm extends Form<IOrder> {
	protected _buttonCard: HTMLButtonElement;
	protected _buttonCash: HTMLButtonElement;
	protected _inputAddress: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttonCard = container.querySelector<HTMLButtonElement>('button[name="card"]');
		this._buttonCash = container.querySelector<HTMLButtonElement>('button[name="cash"]');

		this._inputAddress = container.querySelector<HTMLInputElement>('input[name="address"]');

		this._buttonCard.addEventListener('click', () => this.togglePaymentMethod(this._buttonCard));
		this._buttonCash.addEventListener('click', () => this.togglePaymentMethod(this._buttonCash));
	}

	toggleCard(state: boolean = true) {
		this.toggleClass(this._buttonCard, 'button_alt-active', state);
	}

	toggleCash(state: boolean = true) {
		this.toggleClass(this._buttonCash, 'button_alt-active', state);
	}

	togglePaymentMethod(button: HTMLButtonElement) {
		const isActive = button.classList.contains('button_alt-active');

		this.toggleCard(false);
		this.toggleCash(false);

		if (!isActive) {
			this.toggleClass(button, 'button_alt-active', true);
			this.payment = button.name;
		} else {
			this.payment = null;
		}
	}

	resetPaymentButtons() {
		this.toggleCard(false);
		this.toggleCash(false);
	}

	set address(value: string) {
		this._inputAddress.value = value;
	}

	set payment(value: string) {
		this.events.emit(Events.SET_PAYMENT_METHOD, { paymentType: value });
	}
}