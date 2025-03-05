"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeZone = exports.TimeFormat = exports.DateFormat = exports.FieldType = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const tablesSlice_1 = __importDefault(require("./tablesSlice"));
// Field Types
var FieldType;
(function (FieldType) {
    FieldType["SingleLineText"] = "singleLineText";
    FieldType["MultiLineText"] = "multiLineText";
    FieldType["Select"] = "select";
    FieldType["LongText"] = "longText";
    FieldType["Number"] = "number";
    FieldType["SingleSelect"] = "singleSelect";
    FieldType["MultiSelect"] = "multiSelect";
    FieldType["Date"] = "date";
    FieldType["DateTime"] = "dateTime";
    FieldType["Checkbox"] = "checkbox";
    FieldType["User"] = "user";
    FieldType["Attachment"] = "attachment";
    FieldType["Reference"] = "reference";
    FieldType["Email"] = "email";
    FieldType["Phone"] = "phone";
    FieldType["URL"] = "url";
    FieldType["Duration"] = "duration";
    FieldType["Rating"] = "rating";
    FieldType["Formula"] = "formula";
    FieldType["Rollup"] = "rollup";
    FieldType["Count"] = "count";
    FieldType["Lookup"] = "lookup";
    FieldType["Currency"] = "currency";
    FieldType["Percent"] = "percent";
    FieldType["ForeignKey"] = "foreignKey";
    FieldType["JSON"] = "json";
    FieldType["Trigger"] = "trigger";
})(FieldType || (exports.FieldType = FieldType = {}));
// Redux Store Types
const dummyStore = (0, toolkit_1.configureStore)({
    reducer: { tables: tablesSlice_1.default },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        thunk: {
            extraArgument: {}
        }
    })
});
// --------------------------
// Option Types for Fields
// --------------------------
// Date and Time Options
var DateFormat;
(function (DateFormat) {
    DateFormat["Local"] = "Local";
    DateFormat["Friendly"] = "Friendly";
    DateFormat["US"] = "US";
    DateFormat["European"] = "European";
    DateFormat["ISO"] = "ISO";
})(DateFormat || (exports.DateFormat = DateFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["TwelveHour"] = "12 hour";
    TimeFormat["TwentyFourHour"] = "24 hour";
})(TimeFormat || (exports.TimeFormat = TimeFormat = {}));
var TimeZone;
(function (TimeZone) {
    TimeZone["GMT_UTC"] = "GMT/UTC";
    TimeZone["Local"] = "local";
})(TimeZone || (exports.TimeZone = TimeZone = {}));
//# sourceMappingURL=types.js.map