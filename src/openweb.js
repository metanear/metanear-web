import * as nearlib from "nearlib";
import * as nacl from "tweetnacl";

const GAS = 2_000_000_000_000_000;

/**
  a class representing the OpenWebApp API

  this API supports local contract methods
  - get: gets a value from local storage
  - set: sets a value on local storage
  - remove: deletes a value from local storage

  and remote contract methods
  - pull: reads a message from a remote contract
  - post / send: sends a message to a remote contract
 */
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

  /**
    read private key from local storage
    - if found, recreate the related key pair
    - if not found, create a new key pair and save it to local storage
   */
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

  /**
    initialize the client-side application with a BrowserLocalStorageKeyStore
    and a connection to the NEAR platform, binding OpenWebContract methods:

    - get, set, remove: local invocation methods for controlling the state of local applications
    - pull_message, send_message: remote invocation methods for communicating with contracts of other users
    - apps, num_messages: convenience methods for listing all apps on the OpenWeb and messages for a specific app
   */
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

  /**
    helper method to assert that the user is logged in
   */
  async ready() {
    const key = await this._keyStore.getKey(this._networkId, this.accountId);
    return !!key;
  }

  /**
    produce a public key on the user account
    @return {string} existing (or create new) public key for the current account
   */
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

  /**
    capture new keys in the keystore
   */
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

  /**
    wrap a call in a Promise for async handling?

    @param {Function} call the function to be wrapped in a Promise
    @return {Promise} the Promise to return
   */
  wrappedCall(call) {
    this.blocking = this.blocking.then(() => call()).catch(() => call());
    return this.blocking;
  }

  /**
    unbox encrypted messages
    @param {string} msg64 encrypted message encoded as Base64
    @return {string} decoded contents of the box
   */
  decryptSecretBox(msg64) {
    const buf = Buffer.from(msg64, 'base64');
    const nonce = new Uint8Array(nacl.secretbox.nonceLength);
    buf.copy(nonce, 0, 0, nonce.length);
    const box = new Uint8Array(buf.length - nacl.secretbox.nonceLength);
    buf.copy(box, 0, nonce.length);
    const decodedBuf = nacl.secretbox.open(box, nonce, this._key.secretKey);
    return Buffer.from(decodedBuf).toString()
  }

  /**
    box an unencrypted message
    @param {string} str the message to wrap in a box
    @return {string} base64 encoded box of incoming message
   */
  encryptSecretBox(str) {
    const buf = Buffer.from(str);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const box = nacl.secretbox(buf, nonce, this._key.secretKey);

    const fullBuf = new Uint8Array(box.length + nacl.secretbox.nonceLength);
    fullBuf.set(nonce);
    fullBuf.set(box, nacl.secretbox.nonceLength);
    return Buffer.from(fullBuf).toString('base64')
  }

  /**
    get data from a local app.  apps can decide whether or not to encrypt their contents

    @param {string} key the key used to store a value in the app
    @param {string} appId the application ID
    @param {bool} encrypted flag indicating whether or not the value is box encrypted
    @return {string} the value returned by the local app
   */
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

  /**
    get a value from a remote app installed on another account

    @param {string} accountId account from which to get a value
    @param {string} key the key to use to identify the value
    @param {string} appId the name of the app
    @param {string} encrypted flag indicating whether or not the value is box encrypted
    @return {string} the value returned from the remote app
   */
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

  /**
    return a list of installed apps
    @return {object} collection of installed apps
   */
  async apps() {
    return await this._contract.apps();
  }

  /**
    set a value in local storage

    @param {string} key identifier for the value to be set
    @param {string} value the value to be set
    @param {string} encrypted flag indicating whether or not the value is box encrypted
   */
  async set(key, value, encrypted) {
    this.forceReady();
    await this.wrappedCall(() => this._contract.set({
      key,
      value: encrypted ? this.encryptSecretBox(JSON.stringify(value)) : JSON.stringify(value),
    }, GAS));
  }

  /**
    remove a key-value pair from local storage

    @param {string} key key to be removed
   */
  async remove(key) {
    this.forceReady();
    await this.wrappedCall(() => this._contract.remove({
      key,
    }, GAS));
  }

  /**
    retrieve a message

    @return {any} return async? pull from local storage, null if not found
   */
  async pullMessage() {
    this.forceReady();
    if (await this._contract.num_messages({app_id: this.appId}) > 0) {
      return await this.wrappedCall(() => this._contract.pull_message({}, GAS));
    } else {
      return null;
    }
  }

  /**
    send a message to another account

    @param {string} receiverId account id which will receive the message
    @param {string} message the content of the message
    @param {string} appId the app
   */
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
