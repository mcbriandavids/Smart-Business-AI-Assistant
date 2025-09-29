import { Injectable, Logger } from '@nestjs/common';
import { Language } from './notification.entity';

export interface TranslationTemplate {
  key: string;
  translations: {
    [key in Language]: string;
  };
  variables?: string[];
}

export interface LocalizedNotification {
  title: string;
  message: string;
  language: Language;
}

@Injectable()
export class MultiLanguageService {
  private readonly logger = new Logger(MultiLanguageService.name);
  
  // Translation templates for common notifications
  private readonly templates: Map<string, TranslationTemplate> = new Map([
    ['product_available', {
      key: 'product_available',
      translations: {
        [Language.ENGLISH]: 'Product Available: {{productName}}',
        [Language.PIDGIN]: '{{productName}} don dey available now!',
        [Language.YORUBA]: '{{productName}} ti wa ni oja bayi',
        [Language.HAUSA]: '{{productName}} yana samuwa yanzu',
        [Language.IGBO]: '{{productName}} adịla ugbu a',
        [Language.FRENCH]: 'Produit disponible: {{productName}}',
      },
      variables: ['productName'],
    }],
    ['price_drop', {
      key: 'price_drop',
      translations: {
        [Language.ENGLISH]: 'Price Drop Alert! {{productName}} is now {{newPrice}}',
        [Language.PIDGIN]: 'Price don drop! {{productName}} na {{newPrice}} now',
        [Language.YORUBA]: 'Owo ti din! {{productName}} yi ti di {{newPrice}}',
        [Language.HAUSA]: 'Farashin ya ragu! {{productName}} yanzu {{newPrice}}',
        [Language.IGBO]: 'Ọnụ ahịa adaala! {{productName}} bụ {{newPrice}} ugbu a',
        [Language.FRENCH]: 'Baisse de prix! {{productName}} coûte maintenant {{newPrice}}',
      },
      variables: ['productName', 'newPrice'],
    }],
    ['order_confirmed', {
      key: 'order_confirmed',
      translations: {
        [Language.ENGLISH]: 'Order Confirmed - {{orderNumber}}',
        [Language.PIDGIN]: 'Your order {{orderNumber}} don confirm',
        [Language.YORUBA]: 'A ti gba order {{orderNumber}} rẹ',
        [Language.HAUSA]: 'An tabbatar da odar {{orderNumber}}',
        [Language.IGBO]: 'E kwenyerela order {{orderNumber}} gị',
        [Language.FRENCH]: 'Commande confirmée - {{orderNumber}}',
      },
      variables: ['orderNumber'],
    }],
    ['delivery_update', {
      key: 'delivery_update',
      translations: {
        [Language.ENGLISH]: 'Delivery Update: Your order {{orderNumber}} is {{status}}',
        [Language.PIDGIN]: 'Delivery update: Your order {{orderNumber}} {{status}}',
        [Language.YORUBA]: 'Igbejade soke: Order {{orderNumber}} rẹ ti {{status}}',
        [Language.HAUSA]: 'Sabuntawar isar da kaya: Odar {{orderNumber}} ta {{status}}',
        [Language.IGBO]: 'Mmelite nnyefe: Order {{orderNumber}} gị {{status}}',
        [Language.FRENCH]: 'Mise à jour livraison: Votre commande {{orderNumber}} est {{status}}',
      },
      variables: ['orderNumber', 'status'],
    }],
    ['flash_sale', {
      key: 'flash_sale',
      translations: {
        [Language.ENGLISH]: 'Flash Sale! {{discount}}% off selected items',
        [Language.PIDGIN]: 'Flash sale! {{discount}}% discount for some things',
        [Language.YORUBA]: 'Titaja kiakia! {{discount}}% ẹdinwo lori awọn nkan yiyan',
        [Language.HAUSA]: 'Sai da sauri! {{discount}}% rangwame akan zaɓaɓɓun kayayyaki',
        [Language.IGBO]: 'Ire ngwa ngwa! {{discount}}% mbelata na ihe ndị ahọpụtara',
        [Language.FRENCH]: 'Vente flash! {{discount}}% de réduction sur les articles sélectionnés',
      },
      variables: ['discount'],
    }],
    ['low_stock', {
      key: 'low_stock',
      translations: {
        [Language.ENGLISH]: 'Hurry! Only {{quantity}} left of {{productName}}',
        [Language.PIDGIN]: 'Sharp sharp! Only {{quantity}} remain for {{productName}}',
        [Language.YORUBA]: 'Yara! {{quantity}} nikan ni o ku fun {{productName}}',
        [Language.HAUSA]: 'Gaggawa! {{quantity}} ne kawai ya rage na {{productName}}',
        [Language.IGBO]: 'Mee ngwa ngwa! Naanị {{quantity}} fọdụrụ maka {{productName}}',
        [Language.FRENCH]: 'Dépêchez-vous! Il ne reste que {{quantity}} de {{productName}}',
      },
      variables: ['quantity', 'productName'],
    }],
    ['welcome_message', {
      key: 'welcome_message',
      translations: {
        [Language.ENGLISH]: 'Welcome to our store, {{customerName}}!',
        [Language.PIDGIN]: 'Welcome to our shop, {{customerName}}!',
        [Language.YORUBA]: 'Kaabo si ile itaja wa, {{customerName}}!',
        [Language.HAUSA]: 'Maraba da zuwa kantin mu, {{customerName}}!',
        [Language.IGBO]: 'Nnọọ na ụlọ ahịa anyị, {{customerName}}!',
        [Language.FRENCH]: 'Bienvenue dans notre magasin, {{customerName}}!',
      },
      variables: ['customerName'],
    }],
    ['loyalty_reward', {
      key: 'loyalty_reward',
      translations: {
        [Language.ENGLISH]: 'Congratulations! You earned {{points}} loyalty points',
        [Language.PIDGIN]: 'Congrats! You get {{points}} loyalty points',
        [Language.YORUBA]: 'Oriire! O gba {{points}} awọn point ifarabalẹ',
        [Language.HAUSA]: 'Taya! Ka sami {{points}} maki na aminci',
        [Language.IGBO]: 'Ekele! Ị nwetara {{points}} isi ihe ntụkwasị obi',
        [Language.FRENCH]: 'Félicitations! Vous avez gagné {{points}} points de fidélité',
      },
      variables: ['points'],
    }],
  ]);

  // Message templates for longer content
  private readonly messageTemplates: Map<string, TranslationTemplate> = new Map([
    ['product_available_message', {
      key: 'product_available_message',
      translations: {
        [Language.ENGLISH]: 'Great news! {{productName}} is now available in our store. Get yours before it runs out!',
        [Language.PIDGIN]: 'Good news! {{productName}} don dey available for our shop. Buy your own before e finish!',
        [Language.YORUBA]: 'Iroyin dara! {{productName}} ti wa ninu ile itaja wa bayi. Gba tirẹ ki o to tan!',
        [Language.HAUSA]: 'Labari mai dadi! {{productName}} yana samuwa a kantin mu yanzu. Ka saya naka kafin ya ƙare!',
        [Language.IGBO]: 'Ozi ọma! {{productName}} dị na ụlọ ahịa anyị ugbu a. Nweta nke gị tupu ọ gwụ!',
        [Language.FRENCH]: 'Bonne nouvelle! {{productName}} est maintenant disponible dans notre magasin. Obtenez le vôtre avant qu\'il ne soit épuisé!',
      },
      variables: ['productName'],
    }],
    ['order_confirmed_message', {
      key: 'order_confirmed_message',
      translations: {
        [Language.ENGLISH]: 'Thank you for your order! Order {{orderNumber}} has been confirmed and will be processed within 24 hours.',
        [Language.PIDGIN]: 'Thank you for your order! Order {{orderNumber}} don confirm and we go process am within 24 hours.',
        [Language.YORUBA]: 'O ṣeun fun order rẹ! Order {{orderNumber}} ti gba ati pe a o ṣe ẹ laarin wakati 24.',
        [Language.HAUSA]: 'Na gode da odar ku! An tabbatar da odar {{orderNumber}} kuma za a sarrafa ta cikin sa\'o\'i 24.',
        [Language.IGBO]: 'Daalụ maka order gị! E kwenyerela order {{orderNumber}} ma a ga-ahazi ya n\'ime awa 24.',
        [Language.FRENCH]: 'Merci pour votre commande! La commande {{orderNumber}} a été confirmée et sera traitée dans les 24 heures.',
      },
      variables: ['orderNumber'],
    }],
  ]);

  async translateNotification(
    templateKey: string,
    language: Language,
    variables?: Record<string, any>,
  ): Promise<LocalizedNotification> {
    const titleTemplate = this.templates.get(templateKey);
    const messageTemplate = this.messageTemplates.get(`${templateKey}_message`);

    if (!titleTemplate) {
      this.logger.warn(`Translation template not found for key: ${templateKey}`);
      return {
        title: `Notification: ${templateKey}`,
        message: 'Content not available in selected language',
        language,
      };
    }

    let title = titleTemplate.translations[language] || titleTemplate.translations[Language.ENGLISH];
    let message = messageTemplate ? 
      (messageTemplate.translations[language] || messageTemplate.translations[Language.ENGLISH]) :
      title;

    // Replace variables in both title and message
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), String(value));
        message = message.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return {
      title,
      message,
      language,
    };
  }

  async getAvailableLanguages(): Promise<Language[]> {
    return Object.values(Language);
  }

  async addTranslationTemplate(template: TranslationTemplate): Promise<void> {
    this.templates.set(template.key, template);
    this.logger.log(`Added translation template: ${template.key}`);
  }

  async updateTranslationTemplate(
    key: string,
    language: Language,
    translation: string,
  ): Promise<boolean> {
    const template = this.templates.get(key);
    if (!template) {
      this.logger.warn(`Template not found for key: ${key}`);
      return false;
    }

    template.translations[language] = translation;
    this.templates.set(key, template);
    this.logger.log(`Updated translation for ${key} in ${language}`);
    return true;
  }

  async getTranslationTemplate(key: string): Promise<TranslationTemplate | undefined> {
    return this.templates.get(key);
  }

  async getAllTemplateKeys(): Promise<string[]> {
    return Array.from(this.templates.keys());
  }

  // Helper method to determine customer's preferred language
  async detectLanguage(customerId: string): Promise<Language> {
    // Mock implementation - would query customer preferences from database
    // Could also detect from customer's location, browser settings, etc.
    return Language.ENGLISH;
  }

  // Helper method to get localized currency formatting
  formatCurrency(amount: number, language: Language): string {
    const formatters = {
      [Language.ENGLISH]: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
      [Language.PIDGIN]: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
      [Language.YORUBA]: new Intl.NumberFormat('yo-NG', { style: 'currency', currency: 'NGN' }),
      [Language.HAUSA]: new Intl.NumberFormat('ha-NG', { style: 'currency', currency: 'NGN' }),
      [Language.IGBO]: new Intl.NumberFormat('ig-NG', { style: 'currency', currency: 'NGN' }),
      [Language.FRENCH]: new Intl.NumberFormat('fr-NG', { style: 'currency', currency: 'NGN' }),
    };

    return formatters[language]?.format(amount) || formatters[Language.ENGLISH].format(amount);
  }

  // Helper method to get localized date formatting
  formatDate(date: Date, language: Language): string {
    const formatters = {
      [Language.ENGLISH]: new Intl.DateTimeFormat('en-NG'),
      [Language.PIDGIN]: new Intl.DateTimeFormat('en-NG'),
      [Language.YORUBA]: new Intl.DateTimeFormat('yo-NG'),
      [Language.HAUSA]: new Intl.DateTimeFormat('ha-NG'),
      [Language.IGBO]: new Intl.DateTimeFormat('ig-NG'),
      [Language.FRENCH]: new Intl.DateTimeFormat('fr-NG'),
    };

    return formatters[language]?.format(date) || formatters[Language.ENGLISH].format(date);
  }
}