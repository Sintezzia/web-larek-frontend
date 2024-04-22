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

		this._buttonCard.addEventListener('click', () => this.togglePaymentMethod('card'));
		this._buttonCash.addEventListener('click', () => this.togglePaymentMethod('cash'));
	}

	toggleCard(state: boolean = true) {
		this.toggleClass(this._buttonCard, 'button_alt-active', state);
	}

	toggleCash(state: boolean = true) {
		this.toggleClass(this._buttonCash, 'button_alt-active', state);
	}

	togglePaymentMethod(selectedPayment: string) {
		const isCardActive = this._buttonCard.classList.contains('button_alt-active');
		const isCashActive = this._buttonCash.classList.contains('button_alt-active');

		if (selectedPayment === 'card') {
			this.toggleCard(!isCardActive);
			this.payment = isCardActive ? null : 'card';
			if (!isCardActive) this.toggleCash(false);
		} else if (selectedPayment === 'cash') {
			this.toggleCash(!isCashActive);
			this.payment = isCashActive ? null : 'cash';
			if (!isCashActive) this.toggleCard(false);
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