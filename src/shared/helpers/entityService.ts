import axios, {
    AxiosRequestConfig,
    AxiosPromise
} from 'axios';

export class EntityService {
    private entityNames: string[];
    private categoryNames: string[];
    private categoryNamesWithABudget: string[];
    private accountNames: string[];

    constructor() {
        this.setCategoryNamesWithABudget();
        this.setEntityNames();
        this.setAccountNames();

    }
    private setEntityNames(): void {
        this.entityNames = ['Account', 'Category'];
    }

    private async setCategoryNames(): Promise < void > {
        let url = `https://nestjsbackend.herokuapp.com/category/`;
        let res = await axios.get(url);
        this.categoryNames = res.data;
    }

    private async setAccountNames() {
        let url = `https://nestjsbackend.herokuapp.com/accounts/`;
        const {
            data
        } = await axios.get(url);
        this.accountNames = data;
    }

    private async setCategoryNamesWithABudget(): Promise < void > {
        let url = `https://nestjsbackend.herokuapp.com/budget/`;
        let res = await axios.get(url);
        this.categoryNamesWithABudget = res.data;
    }

    public getCategoryNamesWithABudget(): string[] {
        return this.categoryNamesWithABudget;
    }

    public getEntityNames(): string[] {
        return this.entityNames;
    }

    public categoryNamesWithABudgetContains(categoryName: string) {
        return (this.categoryNamesWithABudget.findIndex(cat => cat === categoryName) !== -1);
    }

    public accountNamesContains(accountName: string) {
        return (this.accountNames.findIndex(acc => acc === accountName) !== -1);
    }


}