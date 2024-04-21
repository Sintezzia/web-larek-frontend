import './scss/styles.scss';
import WebLarekApi from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Events, IOrder, IProduct } from './types';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/common/page';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { OrderForm } from './components/orderForm';
import { ContactsForm } from './components/contactsForm';
import  { EventEmitter } from './components/base/events';
import { BasketItem, CatalogItem } from './components/common/product';
import { Success } from './components/common/success';

// Все шаблоны
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const events = new EventEmitter();
const api = new WebLarekApi(API_URL);
const appData = new AppState({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);

// Для отслеживания логов
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Бизнес логика

/**
 * Изменились элементы каталога
 */
events.on<CatalogChangeEvent>(Events.ITEMS_CHANGED, () => {
	page.catalog = appData.catalog.map((item) => {
		const product = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit(Events.OPEN_PREVIEW, item),
		});

		return product.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			price: item.price !== null ? item.price.toString() + ' синапсов' : '',
			category: item.category,
		});
	});

	page.counter = appData.getBasket().length;
});

// Открыть превью товара
events.on(Events.OPEN_PREVIEW, (item: IProduct) => {
	appData.setPreview(item);
});

// Изменен открытый выбранный товар
events.on(Events.CHANGED_PREVIEW, (item: IProduct) => {
	const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => events.emit(Events.ADD_PRODUCT, item),
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			category: item.category,
			price: item.price !== null ? item.price?.toString() + ' синапсов' : '',
			status: {
				status: item.price === null || appData.basket.has(item.id),
			},
		}),
	});
});

//!Корзина

// Добавить элемент в корзину
events.on(Events.ADD_PRODUCT, (item: IProduct) => {
	appData.addItemInBasket(item);
	modal.close();
});

// Открыть корзину
events.on(Events.BASKET_OPEN, () => {
	const items = appData.getBasket().map((item, index) => {
		const product = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit(Events.REMOVE_PRODUCT, item),
		});
		return product.render({
			index: index + 1,
			title: item.title,
			description: item.description,
			price: item.price?.toString() || '0',
			category: item.category,
		});
	});
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.render({
				items,
				total: appData.getTotalPrice(),
			}),
		]),
	});
});

// Удаляем товар из корзины

events.on(Events.REMOVE_PRODUCT, (item: IProduct) => {
	appData.removeItemFromBasket(item);
});

// Отправлена форма заказа
events.on(/(^order|^contacts):submit/, () => {
	if (!appData.order.email || !appData.order.address || !appData.order.phone)
		return events.emit(Events.ORDER_OPEN);
	const items = appData.getBasket();
	events.emit(Events.CREATE_ORDER);

	api
		.createOrder({
			...appData.order,
			items: items.map((i) => i.id),
			total: appData.getTotalPrice(),
		})
		.then((result) => {
			const success = new Success(cloneTemplate(successOrderTemplate), {
				onClick: () => {
					modal.close();
					events.emit(Events.ORDER_CLEAR);
				},
			});

			modal.render({
				content: success.render({
					title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
					description: !result.error ? `Списано ${result.total} синапсов` : result.error,
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			events.emit(Events.ORDER_CLEAR);
		});
});

// Очистить заказ и корзину

events.on(Events.ORDER_CLEAR, () => {
	appData.clearBasket();
	appData.clearOrder();
	orderForm.resetPaymentButtons();
});

// Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CHANGE, (errors: Partial<IOrder>) => {
	const { email, phone, address, payment } = errors;
	orderForm.valid = !address && !payment;
	orderForm.errors = Object.values(errors)
		.filter((i) => !!i)
		.join(', ');

	contactsForm.valid = !email && !phone;
	contactsForm.errors = Object.values(errors)
		.filter((i) => !!i)
		.join(', ');
});

// Изменилось одно из полей
events.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Открыть форму заказа
events.on(Events.ORDER_OPEN, () => {
	if (!appData.order.address && !appData.order.payment) {
		const data = { address: '' }
		modal.render({
			content: orderForm.render({
				valid: false,
				errors: [],
				...data
			}),
		});
	} else {
		const data = { phone: '', email: '' }
		modal.render({
			content: contactsForm.render({
				valid: false,
				errors: [],
				...data
			}),
		});
	}
});

events.on(Events.SET_PAYMENT_METHOD, (data: { paymentType: string }) => {
	appData.setOrderField('payment'	, data.paymentType);
});

// Блокируем прокрутку страницы если открыта модалка
events.on(Events.MODAL_OPEN, () => {
	page.locked = true;
});

// ... и разблокируем
events.on(Events.MODAL_CLOSE, () => {
	page.locked = false;
	appData.clearOrder();
});

// Получаем лоты с сервера
api
	.getProducts()
	.then(appData.setCatalog.bind(appData))
	.catch(console.error);