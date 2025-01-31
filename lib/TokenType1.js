"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// require deps
// imports
var bitbox_sdk_1 = require("bitbox-sdk");
var Address_1 = require("./Address");
// consts
var BigNumber = require("bignumber.js");
var slpjs = require("slpjs");
var addy = new Address_1.default();
var TokenType1 = /** @class */ (function () {
    function TokenType1(restURL) {
        this.restURL = restURL;
    }
    TokenType1.prototype.create = function (createConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var network, BITBOX_1, bitboxNetwork, batonReceiverAddress, balances, initialTokenQty, genesisTxid, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // validate address formats
                        this.validateAddressFormat(createConfig);
                        network = this.returnNetwork(createConfig.fundingAddress);
                        BITBOX_1 = this.returnBITBOXInstance(network);
                        bitboxNetwork = new slpjs.BitboxNetwork(BITBOX_1);
                        batonReceiverAddress = void 0;
                        if (createConfig.batonReceiverAddress !== undefined &&
                            createConfig.batonReceiverAddress !== "" &&
                            createConfig.batonReceiverAddress !== null)
                            batonReceiverAddress = createConfig.batonReceiverAddress;
                        else
                            batonReceiverAddress = null;
                        return [4 /*yield*/, bitboxNetwork.getAllSlpBalancesAndUtxos(createConfig.fundingAddress)];
                    case 1:
                        balances = _a.sent();
                        initialTokenQty = createConfig.initialTokenQty;
                        initialTokenQty = new BigNumber(initialTokenQty).times(Math.pow(10, createConfig.decimals));
                        balances.nonSlpUtxos.forEach(function (txo) { return (txo.wif = createConfig.fundingWif); });
                        return [4 /*yield*/, bitboxNetwork.simpleTokenGenesis(createConfig.name, createConfig.symbol, initialTokenQty, createConfig.documentUri, createConfig.documentHash, createConfig.decimals, createConfig.tokenReceiverAddress, batonReceiverAddress, createConfig.bchChangeReceiverAddress, balances.nonSlpUtxos)];
                    case 2:
                        genesisTxid = _a.sent();
                        return [2 /*return*/, genesisTxid];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, error_1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TokenType1.prototype.mint = function (mintConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var network, BITBOX_2, bitboxNetwork, batonReceiverAddress, balances, tokenInfo, mintQty, inputUtxos, mintTxid, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("mintConfig", mintConfig);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // validate address formats
                        this.validateAddressFormat(mintConfig);
                        network = this.returnNetwork(mintConfig.fundingAddress);
                        BITBOX_2 = this.returnBITBOXInstance(network);
                        bitboxNetwork = new slpjs.BitboxNetwork(BITBOX_2);
                        batonReceiverAddress = addy.toSLPAddress(mintConfig.batonReceiverAddress);
                        console.log("batonReceiverAddress", batonReceiverAddress);
                        return [4 /*yield*/, bitboxNetwork.getAllSlpBalancesAndUtxos(mintConfig.fundingAddress)];
                    case 2:
                        balances = _a.sent();
                        console.log("balances", balances);
                        console.log("balances.slpBatonUtxos", balances.slpBatonUtxos);
                        if (!balances.slpBatonUtxos[mintConfig.tokenId])
                            throw Error("You don't have the minting baton for this token");
                        return [4 /*yield*/, bitboxNetwork.getTokenInformation(mintConfig.tokenId)];
                    case 3:
                        tokenInfo = _a.sent();
                        mintQty = new BigNumber(mintConfig.additionalTokenQty).times(Math.pow(10, tokenInfo.decimals));
                        inputUtxos = balances.slpBatonUtxos[mintConfig.tokenId];
                        inputUtxos = inputUtxos.concat(balances.nonSlpUtxos);
                        inputUtxos.forEach(function (txo) { return (txo.wif = mintConfig.fundingWif); });
                        return [4 /*yield*/, bitboxNetwork.simpleTokenMint(mintConfig.tokenId, mintQty, inputUtxos, mintConfig.tokenReceiverAddress, batonReceiverAddress, mintConfig.bchChangeReceiverAddress)];
                    case 4:
                        mintTxid = _a.sent();
                        return [2 /*return*/, mintTxid];
                    case 5:
                        error_2 = _a.sent();
                        return [2 /*return*/, error_2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    TokenType1.prototype.send = function (sendConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var network, BITBOX_3, bitboxNetwork, tokenId_1, bchChangeReceiverAddress, tokenInfo, tokenDecimals_1, amount_1, balances_1, inputUtxos, sendTxid, utxos_1, balances, tokenBalances, bchBalances, amount_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        // validate address formats
                        this.validateAddressFormat(sendConfig);
                        network = void 0;
                        if (!Array.isArray(sendConfig.fundingAddress))
                            network = this.returnNetwork(sendConfig.fundingAddress);
                        else
                            network = this.returnNetwork(sendConfig.fundingAddress[0]);
                        BITBOX_3 = this.returnBITBOXInstance(network);
                        bitboxNetwork = new slpjs.BitboxNetwork(BITBOX_3);
                        tokenId_1 = sendConfig.tokenId;
                        bchChangeReceiverAddress = addy.toSLPAddress(sendConfig.bchChangeReceiverAddress);
                        return [4 /*yield*/, bitboxNetwork.getTokenInformation(tokenId_1)];
                    case 1:
                        tokenInfo = _a.sent();
                        tokenDecimals_1 = tokenInfo.decimals;
                        if (!!Array.isArray(sendConfig.fundingAddress)) return [3 /*break*/, 4];
                        amount_1 = sendConfig.amount;
                        return [4 /*yield*/, bitboxNetwork.getAllSlpBalancesAndUtxos(sendConfig.fundingAddress)];
                    case 2:
                        balances_1 = _a.sent();
                        if (!Array.isArray(amount_1)) {
                            amount_1 = new BigNumber(amount_1).times(Math.pow(10, tokenDecimals_1)); // Don't forget to account for token precision
                        }
                        else {
                            amount_1.forEach(function (amt, index) {
                                amount_1[index] = new BigNumber(amt).times(Math.pow(10, tokenDecimals_1)); // Don't forget to account for token precision
                            });
                        }
                        inputUtxos = balances_1.slpTokenUtxos[tokenId_1];
                        inputUtxos = inputUtxos.concat(balances_1.nonSlpUtxos);
                        inputUtxos.forEach(function (txo) { return (txo.wif = sendConfig.fundingWif); });
                        return [4 /*yield*/, bitboxNetwork.simpleTokenSend(tokenId_1, amount_1, inputUtxos, sendConfig.tokenReceiverAddress, bchChangeReceiverAddress)];
                    case 3:
                        sendTxid = _a.sent();
                        return [2 /*return*/, sendTxid];
                    case 4:
                        utxos_1 = [];
                        return [4 /*yield*/, bitboxNetwork.getAllSlpBalancesAndUtxos(sendConfig.fundingAddress)
                            // Sign and add input token UTXOs
                        ];
                    case 5:
                        balances = _a.sent();
                        tokenBalances = balances.filter(function (i) {
                            try {
                                return i.result.slpTokenBalances[tokenId_1].isGreaterThan(0);
                            }
                            catch (_) {
                                return false;
                            }
                        });
                        tokenBalances.map(function (i) {
                            return i.result.slpTokenUtxos[tokenId_1].forEach(function (j) { return (j.wif = sendConfig.fundingWif[i.address]); });
                        });
                        tokenBalances.forEach(function (a) {
                            try {
                                a.result.slpTokenUtxos[tokenId_1].forEach(function (txo) { return utxos_1.push(txo); });
                            }
                            catch (_) { }
                        });
                        bchBalances = balances.filter(function (i) { return i.result.nonSlpUtxos.length > 0; });
                        bchBalances.map(function (i) {
                            return i.result.nonSlpUtxos.forEach(function (j) { return (j.wif = sendConfig.fundingWif[i.address]); });
                        });
                        bchBalances.forEach(function (a) {
                            return a.result.nonSlpUtxos.forEach(function (txo) { return utxos_1.push(txo); });
                        });
                        utxos_1.forEach(function (txo) {
                            if (Array.isArray(sendConfig.fundingAddress)) {
                                sendConfig.fundingAddress.forEach(function (address, index) {
                                    if (txo.cashAddress === addy.toCashAddress(address))
                                        txo.wif = sendConfig.fundingWif[index];
                                });
                            }
                        });
                        amount_2 = sendConfig.amount;
                        if (!Array.isArray(amount_2)) {
                            amount_2 = new BigNumber(amount_2).times(Math.pow(10, tokenDecimals_1)); // Don't forget to account for token precision
                        }
                        else {
                            amount_2.forEach(function (amt, index) {
                                amount_2[index] = new BigNumber(amt).times(Math.pow(10, tokenDecimals_1)); // Don't forget to account for token precision
                            });
                        }
                        return [4 /*yield*/, bitboxNetwork.simpleTokenSend(tokenId_1, amount_2, utxos_1, sendConfig.tokenReceiverAddress, bchChangeReceiverAddress)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        error_3 = _a.sent();
                        return [2 /*return*/, error_3];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    TokenType1.prototype.burn = function (burnConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var network, BITBOX_4, bitboxNetwork, bchChangeReceiverAddress, tokenInfo, tokenDecimals, balances, amount, inputUtxos, burnTxid, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // validate address formats
                        this.validateAddressFormat(burnConfig);
                        network = this.returnNetwork(burnConfig.fundingAddress);
                        BITBOX_4 = this.returnBITBOXInstance(network);
                        bitboxNetwork = new slpjs.BitboxNetwork(BITBOX_4);
                        bchChangeReceiverAddress = addy.toSLPAddress(burnConfig.bchChangeReceiverAddress);
                        return [4 /*yield*/, bitboxNetwork.getTokenInformation(burnConfig.tokenId)];
                    case 1:
                        tokenInfo = _a.sent();
                        tokenDecimals = tokenInfo.decimals;
                        return [4 /*yield*/, bitboxNetwork.getAllSlpBalancesAndUtxos(burnConfig.fundingAddress)];
                    case 2:
                        balances = _a.sent();
                        amount = new BigNumber(burnConfig.amount).times(Math.pow(10, tokenDecimals));
                        inputUtxos = balances.slpTokenUtxos[burnConfig.tokenId];
                        inputUtxos = inputUtxos.concat(balances.nonSlpUtxos);
                        inputUtxos.forEach(function (txo) { return (txo.wif = burnConfig.fundingWif); });
                        return [4 /*yield*/, bitboxNetwork.simpleTokenBurn(burnConfig.tokenId, amount, inputUtxos, bchChangeReceiverAddress)];
                    case 3:
                        burnTxid = _a.sent();
                        return [2 /*return*/, burnTxid];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, error_4];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TokenType1.prototype.returnNetwork = function (address) {
        return addy.detectAddressNetwork(address);
    };
    TokenType1.prototype.returnBITBOXInstance = function (network) {
        var tmpBITBOX;
        var restURL;
        if (network === "mainnet")
            restURL = "https://rest.bitcoin.com/v2/";
        else
            restURL = "https://trest.bitcoin.com/v2/";
        return new bitbox_sdk_1.BITBOX({ restURL: restURL });
    };
    TokenType1.prototype.validateAddressFormat = function (config) {
        // validate address formats
        // fundingAddress, tokenReceiverAddress and batonReceiverAddress must be simpleledger format
        // bchChangeReceiverAddress can be either simpleledger or cashAddr format
        // validate fundingAddress format
        // single fundingAddress
        if (config.fundingAddress && !addy.isSLPAddress(config.fundingAddress))
            throw Error("Funding Address must be simpleledger format");
        // bulk fundingAddress
        if (config.fundingAddress && Array.isArray(config.fundingAddress)) {
            config.fundingAddress.forEach(function (address) {
                if (!addy.isSLPAddress(address))
                    throw Error("Funding Address must be simpleledger format");
            });
        }
        // validate tokenReceiverAddress format
        // single tokenReceiverAddress
        if (config.tokenReceiverAddress &&
            !addy.isSLPAddress(config.tokenReceiverAddress))
            throw Error("Token Receiver Address must be simpleledger format");
        // bulk tokenReceiverAddress
        if (config.tokenReceiverAddress &&
            Array.isArray(config.tokenReceiverAddress)) {
            config.tokenReceiverAddress.forEach(function (address) {
                if (!addy.isSLPAddress(address))
                    throw Error("Token Receiver Address must be simpleledger format");
            });
        }
        // validate bchChangeReceiverAddress format
        if (config.bchChangeReceiverAddress &&
            !addy.isCashAddress(config.bchChangeReceiverAddress))
            throw Error("BCH Change Receiver Address must be cash address format");
        // validate batonReceiverAddress format
        if (config.batonReceiverAddress &&
            !addy.isSLPAddress(config.batonReceiverAddress))
            throw Error("Baton Receiver Address must be simpleledger format");
    };
    return TokenType1;
}());
exports.default = TokenType1;
