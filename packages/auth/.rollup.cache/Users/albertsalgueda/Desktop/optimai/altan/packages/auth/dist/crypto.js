import { __awaiter } from "tslib";
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
export function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt.hash(password, SALT_ROUNDS);
    });
}
export function comparePasswords(plainPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt.compare(plainPassword, hashedPassword);
    });
}
//# sourceMappingURL=crypto.js.map