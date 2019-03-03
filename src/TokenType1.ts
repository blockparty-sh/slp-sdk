// require deps
const BITBOXSDK: any = require("bitbox-sdk/lib/bitbox-sdk").default
const BigNumber: any = require("bignumber.js")
const slpjs: any = require("slpjs")

// import interfaces
import {
  ICreateConfig,
  IMintConfig,
  ISendConfig,
  IBurnAllConfig,
  IBurnConfig,
  ICreateP2MSConfig,
  IMintP2MSConfig
} from "./interfaces/SLPInterfaces"

// import classes
import Address from "./Address"
let addy: any = new Address()

class TokenType1 {
  restURL: string
  constructor(restURL?: string) {
    this.restURL = restURL
  }

  async create(createConfig: ICreateConfig) {
    let tmpBITBOX: any = this.returnBITBOXInstance(createConfig.fundingAddress)

    const getRawTransactions = async (txids: any) => {
      return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
    }

    const slpValidator: any = new slpjs.LocalValidator(
      tmpBITBOX,
      getRawTransactions
    )
    const bitboxNetwork: any = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)
    const fundingAddress: string = addy.toSLPAddress(
      createConfig.fundingAddress
    )
    const fundingWif: string = createConfig.fundingWif
    const tokenReceiverAddress: string = addy.toSLPAddress(
      createConfig.tokenReceiverAddress
    )
    let batonReceiverAddress: string
    if (
      createConfig.batonReceiverAddress !== undefined &&
      createConfig.batonReceiverAddress !== "" &&
      createConfig.batonReceiverAddress !== null
    ) {
      batonReceiverAddress = addy.toSLPAddress(
        createConfig.batonReceiverAddress
      )
    } else {
      batonReceiverAddress = null
    }

    const bchChangeReceiverAddress: string = addy.toSLPAddress(
      createConfig.bchChangeReceiverAddress
    )
    const balances: any = await bitboxNetwork.getAllSlpBalancesAndUtxos(
      fundingAddress
    )

    const decimals: number = createConfig.decimals
    const name: string = createConfig.name
    const symbol: string = createConfig.symbol
    const documentUri: string = createConfig.documentUri
    const documentHash: any = createConfig.documentHash

    let initialTokenQty: number = createConfig.initialTokenQty

    initialTokenQty = new BigNumber(initialTokenQty).times(10 ** decimals)
    balances.nonSlpUtxos.forEach((txo: any) => (txo.wif = fundingWif))
    const genesisTxid = await bitboxNetwork.simpleTokenGenesis(
      name,
      symbol,
      initialTokenQty,
      documentUri,
      documentHash,
      decimals,
      tokenReceiverAddress,
      batonReceiverAddress,
      bchChangeReceiverAddress,
      balances.nonSlpUtxos
    )
    return genesisTxid
  }

  async mint(mintConfig: IMintConfig) {
    let tmpBITBOX: any = this.returnBITBOXInstance(mintConfig.fundingAddress)

    const getRawTransactions = async (txids: any) => {
      return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
    }

    const slpValidator: any = new slpjs.LocalValidator(
      tmpBITBOX,
      getRawTransactions
    )
    const bitboxNetwork: any = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)
    const fundingAddress: string = addy.toSLPAddress(mintConfig.fundingAddress)
    const fundingWif: string = mintConfig.fundingWif
    const tokenReceiverAddress: string = addy.toSLPAddress(
      mintConfig.tokenReceiverAddress
    )
    const batonReceiverAddress: string = addy.toSLPAddress(
      mintConfig.batonReceiverAddress
    )
    const bchChangeReceiverAddress: string = addy.toSLPAddress(
      mintConfig.bchChangeReceiverAddress
    )
    const tokenId: string = mintConfig.tokenId
    let additionalTokenQty: number = mintConfig.additionalTokenQty
    let balances: any = await bitboxNetwork.getAllSlpBalancesAndUtxos(
      fundingAddress
    )
    if (!balances.slpBatonUtxos[tokenId])
      throw Error("You don't have the minting baton for this token")

    const tokenInfo: any = await bitboxNetwork.getTokenInformation(tokenId)
    let tokenDecimals: number = tokenInfo.decimals

    // 3) Multiply the specified token quantity by 10^(token decimal precision)
    let mintQty = new BigNumber(additionalTokenQty).times(10 ** tokenDecimals)

    // 4) Filter the list to choose ONLY the baton of interest
    // NOTE: (spending other batons for other tokens will result in losing ability to mint those tokens)
    let inputUtxos = balances.slpBatonUtxos[tokenId]

    // 5) Simply sweep our BCH (non-SLP) utxos to fuel the transaction
    inputUtxos = inputUtxos.concat(balances.nonSlpUtxos)

    // 6) Set the proper private key for each Utxo
    inputUtxos.forEach((txo: any) => (txo.wif = fundingWif))

    let mintTxid = await bitboxNetwork.simpleTokenMint(
      tokenId,
      mintQty,
      inputUtxos,
      tokenReceiverAddress,
      batonReceiverAddress,
      bchChangeReceiverAddress
    )
    return mintTxid
  }

  async send(sendConfig: ISendConfig) {
    let tmpBITBOX: any = this.returnBITBOXInstance(sendConfig.fundingAddress)

    const getRawTransactions = async (txids: any) => {
      return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
    }

    const slpValidator: any = new slpjs.LocalValidator(
      tmpBITBOX,
      getRawTransactions
    )
    const bitboxNetwork = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)

    const fundingAddress: string = addy.toSLPAddress(sendConfig.fundingAddress)
    const fundingWif: string = sendConfig.fundingWif
    const tokenReceiverAddress: string = addy.toSLPAddress(
      sendConfig.tokenReceiverAddress
    )
    const bchChangeReceiverAddress: string = addy.toSLPAddress(
      sendConfig.bchChangeReceiverAddress
    )
    let tokenId: string = sendConfig.tokenId
    let amount: number = sendConfig.amount

    const tokenInfo: any = await bitboxNetwork.getTokenInformation(tokenId)
    let tokenDecimals: number = tokenInfo.decimals

    let balances: any = await bitboxNetwork.getAllSlpBalancesAndUtxos(
      fundingAddress
    )

    // 3) Calculate send amount in "Token Satoshis".  In this example we want to just send 1 token unit to someone...
    amount = new BigNumber(amount).times(10 ** tokenDecimals) // Don't forget to account for token precision

    // 4) Get all of our token's UTXOs
    let inputUtxos = balances.slpTokenUtxos[tokenId]

    // 5) Simply sweep our BCH utxos to fuel the transaction
    inputUtxos = inputUtxos.concat(balances.nonSlpUtxos)

    // 6) Set the proper private key for each Utxo
    inputUtxos.forEach((txo: any) => (txo.wif = fundingWif))

    let sendTxid = await bitboxNetwork.simpleTokenSend(
      tokenId,
      amount,
      inputUtxos,
      tokenReceiverAddress,
      bchChangeReceiverAddress
    )
    return sendTxid
  }

  async burnAll(burnAllConfig: IBurnAllConfig) {
    try {
      let tmpBITBOX: any = this.returnBITBOXInstance(
        burnAllConfig.fundingAddress
      )

      const getRawTransactions = async (txids: any) => {
        return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
      }

      const slpValidator: any = new slpjs.LocalValidator(
        tmpBITBOX,
        getRawTransactions
      )
      const bitboxNetwork = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)
      const tokenInfo = await bitboxNetwork.getTokenInformation(
        burnAllConfig.tokenId
      )
      let tokenDecimals = tokenInfo.decimals

      let balances = await bitboxNetwork.getAllSlpBalancesAndUtxos(
        burnAllConfig.fundingAddress
      )
      let inputUtxos = balances.slpTokenUtxos[burnAllConfig.tokenId]
      inputUtxos = inputUtxos.concat(balances.nonSlpUtxos)

      inputUtxos.forEach((txo: any) => (txo.wif = burnAllConfig.fundingWif))
      let network: string = this.returnNetwork(burnAllConfig.fundingAddress)
      let transactionBuilder: any
      if (network === "mainnet") {
        transactionBuilder = new tmpBITBOX.TransactionBuilder("mainnet")
      } else {
        transactionBuilder = new tmpBITBOX.TransactionBuilder("testnet")
      }

      let originalAmount: number = 0
      inputUtxos.forEach((utxo: any) => {
        // index of vout
        let vout: string = utxo.vout

        // txid of vout
        let txid: string = utxo.txid

        // add input with txid and index of vout
        transactionBuilder.addInput(txid, vout)

        originalAmount += utxo.satoshis
      })

      let byteCount = tmpBITBOX.BitcoinCash.getByteCount(
        { P2PKH: inputUtxos.length },
        { P2PKH: 1 }
      )
      let sendAmount = originalAmount - byteCount

      transactionBuilder.addOutput(
        addy.toCashAddress(burnAllConfig.bchChangeReceiverAddress),
        sendAmount
      )

      let keyPair = tmpBITBOX.ECPair.fromWIF(burnAllConfig.fundingWif)

      let redeemScript: void
      inputUtxos.forEach((utxo: any, index: number) => {
        transactionBuilder.sign(
          index,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          utxo.satoshis
        )
      })

      let tx = transactionBuilder.build()
      let hex = tx.toHex()
      let txid = await tmpBITBOX.RawTransactions.sendRawTransaction(hex)
      return txid
    } catch (error) {
      return error
    }
  }

  async burn(burnConfig: IBurnConfig) {
    try {
      let tmpBITBOX: any = this.returnBITBOXInstance(burnConfig.fundingAddress)

      const getRawTransactions = async (txids: any) => {
        return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
      }

      const slpValidator: any = new slpjs.LocalValidator(
        tmpBITBOX,
        getRawTransactions
      )
      const bitboxNetwork = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)
      const fundingAddress: string = addy.toSLPAddress(
        burnConfig.fundingAddress
      )
      const bchChangeReceiverAddress: string = addy.toSLPAddress(
        burnConfig.bchChangeReceiverAddress
      )
      const tokenInfo = await bitboxNetwork.getTokenInformation(
        burnConfig.tokenId
      )
      const tokenDecimals = tokenInfo.decimals
      const balances = await bitboxNetwork.getAllSlpBalancesAndUtxos(
        fundingAddress
      )
      let amount = new BigNumber(burnConfig.amount).times(10 ** tokenDecimals)
      let inputUtxos = balances.slpTokenUtxos[burnConfig.tokenId]

      inputUtxos = inputUtxos.concat(balances.nonSlpUtxos)

      inputUtxos.forEach((txo: any) => (txo.wif = burnConfig.fundingWif))
      const burnTxid = await bitboxNetwork.simpleTokenBurn(
        burnConfig.tokenId,
        amount,
        inputUtxos,
        bchChangeReceiverAddress
      )
      return burnTxid
    } catch (error) {
      return error
    }
  }

  returnNetwork(address: string): string {
    return addy.detectAddressNetwork(address)
  }

  returnBITBOXInstance(address: string): any {
    let network: string = this.returnNetwork(address)
    let tmpBITBOX: any

    if (network === "mainnet") {
      tmpBITBOX = new BITBOXSDK({ restURL: "https://rest.bitcoin.com/v2/" })
    } else {
      tmpBITBOX = new BITBOXSDK({ restURL: "https://trest.bitcoin.com/v2/" })
    }

    return tmpBITBOX
  }

  async createP2MS(createP2MSConfig: ICreateP2MSConfig) {
    let tmpBITBOX: any = this.returnBITBOXInstance(
      createP2MSConfig.fundingAddress
    )

    const getRawTransactions = async (txids: any) => {
      return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
    }

    const slpValidator: any = new slpjs.LocalValidator(
      tmpBITBOX,
      getRawTransactions
    )

    const bitboxNetwork: any = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)
    const fundingAddress: string = addy.toSLPAddress(
      createP2MSConfig.fundingAddress
    )
    const fundingWif: string = createP2MSConfig.fundingWif
    const tokenReceiverAddresses: string[] = createP2MSConfig.tokenReceiverAddresses.map(
      (address: string) => {
        return addy.toSLPAddress(address)
      }
    )

    let batonReceiverAddresses: string[]
    if (
      createP2MSConfig.batonReceiverAddresses[0] !== undefined &&
      createP2MSConfig.batonReceiverAddresses[0] !== "" &&
      createP2MSConfig.batonReceiverAddresses[0] !== null
    ) {
      batonReceiverAddresses = createP2MSConfig.batonReceiverAddresses.map(
        (address: string) => {
          return addy.toSLPAddress(address)
        }
      )
    } else {
      batonReceiverAddresses = null
    }

    const bchChangeReceiverAddresses: string[] = createP2MSConfig.bchChangeReceiverAddresses.map(
      (address: string) => {
        return addy.toSLPAddress(address)
      }
    )

    const balances: any = await bitboxNetwork.getAllSlpBalancesAndUtxos(
      fundingAddress
    )

    const decimals: number = createP2MSConfig.decimals
    const name: string = createP2MSConfig.name
    const symbol: string = createP2MSConfig.symbol
    const documentUri: string = createP2MSConfig.documentUri
    const documentHash: any = createP2MSConfig.documentHash

    let initialTokenQty: number = createP2MSConfig.initialTokenQty

    initialTokenQty = new BigNumber(initialTokenQty).times(10 ** decimals)
    balances.nonSlpUtxos.forEach((txo: any) => (txo.wif = fundingWif))
    const genesisTxid = await bitboxNetwork.p2msTokenGenesis(
      name,
      symbol,
      initialTokenQty,
      documentUri,
      documentHash,
      decimals,
      tokenReceiverAddresses,
      createP2MSConfig.tokenReceiverWifs,
      batonReceiverAddresses,
      createP2MSConfig.batonReceiverWifs,
      bchChangeReceiverAddresses,
      createP2MSConfig.bchChangeReceiverWifs,
      balances.nonSlpUtxos,
      createP2MSConfig.requiredSignatures
    )
    return genesisTxid
  }

  async mintP2MS(mintP2MSConfig: IMintP2MSConfig) {
    let BITBOX = new BITBOXSDK()
    let tmpECPair = BITBOX.ECPair.fromWIF(mintP2MSConfig.tokenReceiverWifs[0])
    let cashAddress = BITBOX.ECPair.toCashAddress(tmpECPair)
    let tmpBITBOX: any = this.returnBITBOXInstance(cashAddress)

    const getRawTransactions = async (txids: any) => {
      return await tmpBITBOX.RawTransactions.getRawTransaction(txids)
    }

    const slpValidator: any = new slpjs.LocalValidator(
      tmpBITBOX,
      getRawTransactions
    )
    const bitboxNetwork: any = new slpjs.BitboxNetwork(tmpBITBOX, slpValidator)

    let mintPubkeys: any[] = []
    mintP2MSConfig.tokenReceiverWifs.forEach((wif: string) => {
      const ecpair = tmpBITBOX.ECPair.fromWIF(wif)
      console.log(tmpBITBOX.ECPair.toCashAddress(ecpair))
      mintPubkeys.push(tmpBITBOX.ECPair.toPublicKey(ecpair))
    })
    console.log("mintPubkeys", mintPubkeys)

    const mintBuf = tmpBITBOX.Script.multisig.output.encode(
      mintP2MSConfig.requiredSignatures,
      mintPubkeys
    )

    const scriptHash = tmpBITBOX.Crypto.hash160(mintBuf)
    console.log("scriptHash", scriptHash)
    const data2 = tmpBITBOX.Script.scriptHash.output.encode(scriptHash)
    console.log("DATTTA", data2)

    return false
    const fundingAddress: string = addy.toSLPAddress(mintConfig.fundingAddress)
    const fundingWif: string = mintConfig.fundingWif
    const tokenReceiverAddress: string = addy.toSLPAddress(
      mintConfig.tokenReceiverAddress
    )
    const batonReceiverAddress: string = addy.toSLPAddress(
      mintConfig.batonReceiverAddress
    )
    const bchChangeReceiverAddress: string = addy.toSLPAddress(
      mintConfig.bchChangeReceiverAddress
    )
    const tokenId: string = mintConfig.tokenId
    let additionalTokenQty: number = mintConfig.additionalTokenQty
    let balances: any = await bitboxNetwork.getAllSlpBalancesAndUtxos(
      fundingAddress
    )
    if (!balances.slpBatonUtxos[tokenId])
      throw Error("You don't have the minting baton for this token")

    const tokenInfo: any = await bitboxNetwork.getTokenInformation(tokenId)
    let tokenDecimals: number = tokenInfo.decimals

    // 3) Multiply the specified token quantity by 10^(token decimal precision)
    let mintQty = new BigNumber(additionalTokenQty).times(10 ** tokenDecimals)

    // 4) Filter the list to choose ONLY the baton of interest
    // NOTE: (spending other batons for other tokens will result in losing ability to mint those tokens)
    let inputUtxos = balances.slpBatonUtxos[tokenId]

    // 5) Simply sweep our BCH (non-SLP) utxos to fuel the transaction
    inputUtxos = inputUtxos.concat(balances.nonSlpUtxos)

    // 6) Set the proper private key for each Utxo
    inputUtxos.forEach((txo: any) => (txo.wif = fundingWif))

    let mintTxid = await bitboxNetwork.simpleTokenMint(
      tokenId,
      mintQty,
      inputUtxos,
      tokenReceiverAddress,
      batonReceiverAddress,
      bchChangeReceiverAddress
    )
    return mintTxid
  }
}

export default TokenType1
