import * as nearlib from "nearlib";

const GAS = 2_000_000_000_000_000;

export class OpenWebApp {
  constructor(appId, accountId, config) {
    this.appId = appId;
    this.accountId = accountId;
    this._config = config;
    this.blocking = Promise.resolve();
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

  async get(key, appId) {
    appId = appId || this.appId;
    let str = await this._contract.get({
      app_id: appId,
      key,
    });
    if (str) {
      str = JSON.parse(str);
    }
    return str;
  }

  async getFrom(accountId, key, appId) {
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
      str = JSON.parse(str);
    }
    return str;
  }

  async apps() {
    return await this._contract.apps();
  }

  async set(key, value) {
    this.forceReady();
    await this.wrappedCall(() => this._contract.set({
      key,
      value: JSON.stringify(value),
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

