"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAltanDB = void 0;
// src/databases/axios.ts
var axios_1 = __importDefault(require("axios"));
var createAltanDB = function (apiBaseUrl) {
    return axios_1.default.create({
        baseURL: apiBaseUrl
    });
};
exports.createAltanDB = createAltanDB;
