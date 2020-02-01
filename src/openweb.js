import * as nearlib from "nearlib";
import * as nacl from "tweetnacl";

const GAS = 2_000_000_000_000_000;

export class OpenWebApp {
  constructor(appId, accountId, config) {
    this.appId = appId;
    this.accountId = accountId;
    this._config = config;
    this.blocking = Promise.resolve();
    this.parseEncryptionKey();
    window.nacl = nacl;
    window.Buffer = Buffer;
  }

  parseEncryptionKey() {
    const keyKey = "enc_key:" + this.appId + ":";
    let key = localStorage.getItem(keyKey);
    if (key) {
      key = nacl.box.keyPair.fromSecretKey(Buffer.from(key, 'base64'));
    } else {
      key = new nacl.box.keyPair();
      localStorage.setItem(keyKey, Buffer.from(key.secretKey).toString('base64'));
    }
    this._key = key;
  }

  async init() {
    this._keyStore = new nearlib.keyStores.BrowserLocalStorageKeyStore(
      localStorage, "app:" + this.appId,
    );
    this._near = await nearlib.connect(Object.assign({ deps: { keyStore:  this._keyStore } }, this._config));
    this._account = new nearlib.Account(this._near.connection, this.accountId);
    this._contract = new nearlib.Contract(this._account, this.accountId, {
      viewMethods: ['get', 'apps', 'num_messages'],
      changeMethods: ['set', 'remove', 'pull_message', 'send_message'],
      sender: this.accountId
    });
    this._networkId = this._config.networkId;
  }

  async ready() {
    const key = await this._keyStore.getKey(this._networkId, this.accountId);
    return !!key;
  }

  async getPublicKey() {
    const key = await this._keyStore.getKey(this._networkId, this.accountId);
    if (key) {
      return key.getPublicKey();
    }
    if (this._tmpKey) {
      return this._tmpKey.getPublicKey();
    }
    const accessKey = nearlib.KeyPair.fromRandom('ed25519');
    this._tmpKey = accessKey;
    return accessKey.getPublicKey();
  }

  async onKeyAdded() {
    if (!this._tmpKey) {
      throw new Error('The key is not initialized yet');
    }
    await this._keyStore.setKey(this._networkId, this.accountId, this._tmpKey);
    this._tmpKey = null;
  }

  async forceReady() {
    if (!await this.ready()) {
      throw new Error('Not ready yet');
    }
  }

  wrappedCall(call) {
    this.blocking = this.blocking.then(() => call()).catch(() => call());
    return this.blocking;
  }

  decryptSecretBox(msg64) {
    const buf = Buffer.from(msg64, 'base64');
    const nonce = new Uint8Array(nacl.secretbox.nonceLength);
    buf.copy(nonce, 0, 0, nonce.length);
    const box = new Uint8Array(buf.length - nacl.secretbox.nonceLength);
    buf.copy(box, 0, nonce.length);
    const decodedBuf = nacl.secretbox.open(box, nonce, this._key.secretKey);
    return Buffer.from(decodedBuf).toString()
  }

  encryptSecretBox(str) {
    const buf = Buffer.from(str);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const box = nacl.secretbox(buf, nonce, this._key.secretKey);

    const fullBuf = new Uint8Array(box.length + nacl.secretbox.nonceLength);
    fullBuf.set(nonce);
    fullBuf.set(box, nacl.secretbox.nonceLength);
    return Buffer.from(fullBuf).toString('base64')
  }

  async get(key, appId, encrypted) {
    appId = appId || this.appId;
    let str = await this._contract.get({
      app_id: appId,
      key,
    });
    if (str) {
      str = JSON.parse(encrypted ? this.decryptSecretBox(str) : str);
    }
    return str;
  }

  async getFrom(accountId, key, appId, encrypted) {
    appId = appId || this.appId;
    const account = new nearlib.Account(this._near.connection, accountId);
    const contract = new nearlib.Contract(account, accountId, {
      viewMethods: ['get'],
      changeMethods: [],
      sender: this.accountId
    });

    let str = await contract.get({
      app_id: appId,
      key,
    });
    if (str) {
      str = JSON.parse(encrypted ? this.decryptSecretBox(str) : str);
    }
    return str;
  }

  async apps() {
    return await this._contract.apps();
  }

  async set(key, value, encrypted) {
    this.forceReady();
    await this.wrappedCall(() => this._contract.set({
      key,
      value: encrypted ? this.encryptSecretBox(JSON.stringify(value)) : JSON.stringify(value),
    }, GAS));
  }

  async remove(key) {
    this.forceReady();
    await this.wrappedCall(() => this._contract.remove({
      key,
    }, GAS));
  }

  async pullMessage() {
    this.forceReady();
    if (await this._contract.num_messages({app_id: this.appId}) > 0) {
      return await this.wrappedCall(() => this._contract.pull_message({}, GAS));
    } else {
      return null;
    }
  }

  async sendMessage(receiverId, message, appId) {
    this.forceReady();
    receiverId = receiverId || this.accountId;
    appId = appId || this.appId;
    await this.wrappedCall(() => this._contract.send_message({
      receiver_id: receiverId,
      app_id: appId,
      message,
    }, GAS));
  }
}

