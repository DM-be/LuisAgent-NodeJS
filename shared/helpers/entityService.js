"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
class EntityService {
    constructor() {
        this.setCategoryNamesWithABudget();
        this.setEntityNames();
    }
    setEntityNames() {
        this.entityNames = ['Account', 'Category'];
    }
    setCategoryNames() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `https://nestjsbackend.herokuapp.com/category/`;
            let res = yield axios_1.default.get(url);
            this.categoryNames = res.data;
        });
    }
    setCategoryNamesWithABudget() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `https://nestjsbackend.herokuapp.com/budget/`;
            let res = yield axios_1.default.get(url);
            this.categoryNamesWithABudget = res.data;
        });
    }
    getCategoryNamesWithABudget() {
        return this.categoryNamesWithABudget;
    }
    getEntityNames() {
        return this.entityNames;
    }
    categoryNamesWithABudgetContains(categoryName) {
        return (this.categoryNamesWithABudget.findIndex(cat => cat === categoryName) !== -1);
    }
}
exports.EntityService = EntityService;
//# sourceMappingURL=entityService.js.map