type Locale = {
    [localeLang: string]: {
        [localeKey: string]: string
    }
}

export class Localization {
    protected localizationData: Locale = {};
    protected currentLocale: string;
    protected translationElements: NodeListOf<HTMLElement>;

    public loadLocalization(url: string, onLoad?: () => any): void {
        const xhr: XMLHttpRequest = new XMLHttpRequest();

        xhr.open('GET', url);

        xhr.onload = (() => {
            try {
                this.localizationData = JSON.parse(xhr.responseText);
            } catch (e) {
                console.error('Cant parse locale file: ', e);
            }

            if(onLoad !== undefined) onLoad();

            this.applyLocale();
        }).bind(this);

        xhr.onerror = () => {
            console.error('Cant load locatization');
        }

        xhr.send();
    };

    public constructor(initialLocale: string = 'Ru', localizationData?: Locale) {
        this.currentLocale = initialLocale;

        if(localizationData !== undefined) this.localizationData = localizationData;

        this.translationElements = document.querySelectorAll('[data-locale]');
    }

    public getCurrentLocale() : string {
        return this.currentLocale;
    }

    public getLocalesArray(): Array<string> {
        return Object.keys(this.localizationData);
    }

    public applyLocale(): void {

        this.translationElements.forEach((element: HTMLElement) => {
           const localeKey: string | null = element.getAttribute('data-locale');

           if(localeKey === null || !(this.currentLocale in this.localizationData)) return;

           const translatedText: string | undefined = this.localizationData[this.currentLocale][localeKey];

           if(translatedText === undefined) return;

            element.innerHTML = translatedText;
        });
    }

    public changeLocale(newLocale: string): void {
        if(!(newLocale in this.localizationData)) return;

        this.currentLocale = newLocale;
        this.applyLocale();
    }
}