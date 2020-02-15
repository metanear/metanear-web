import * as nearlib from "nearlib";
import * as nacl from "tweetnacl";

const GAS = 2_000_000_000_000_000;

export const encryptionKey = "encryptionKey";

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
    const keyKey = "enc_key:" + this.accountId + ":" + this.appId + ":";
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
    helper method to check if the user is logged in with the app
   */
  async ready() {
    const key = await this._keyStore.getKey(this._networkId, this.accountId);
    return !!key;
  }

  /**
    produce a public key on the user account
    @return {string} existing (or create new) public key for the current account
   */
  async getAccessPublicKey() {
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

  getEncryptionPublicKey() {
    return Buffer.from(this._key.publicKey).toString('base64')
  }

  async storeEncryptionPublicKey() {
    return this.set(encryptionKey, this.getEncryptionPublicKey());
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

  /**
   * enforces that the app is ready
   * @returns {Promise<void>}
   */
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
    unbox encrypted messages with our secret key
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
    box an unencrypted message with our secret key
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
   unbox encrypted messages with our secret key
   @param {string} msg64 encrypted message encoded as Base64
   @param {Uint8Array} theirPublicKey the public key to use to verify the message
   @return {string} decoded contents of the box
   */
  decryptBox(msg64, theirPublicKey) {
    if (theirPublicKey.length != nacl.box.publicKeyLength) {
      throw new Error("Given encryption public key is invalid.");
    }
    const buf = Buffer.from(msg64, 'base64');
    const nonce = new Uint8Array(nacl.box.nonceLength);
    buf.copy(nonce, 0, 0, nonce.length);
    const box = new Uint8Array(buf.length - nacl.box.nonceLength);
    buf.copy(box, 0, nonce.length);
    const decodedBuf = nacl.box.open(box, nonce, theirPublicKey, this._key.secretKey);
    return Buffer.from(decodedBuf).toString()
  }

  /**
   box an unencrypted message with their public key and sign it with our secret key
   @param {string} str the message to wrap in a box
   @param {Uint8Array} theirPublicKey the public key to use to encrypt the message
   @returns {string} base64 encoded box of incoming message
   */
  encryptBox(str, theirPublicKey) {
    if (theirPublicKey.length != nacl.box.publicKeyLength) {
      throw new Error("Given encryption public key is invalid.");
    }
    const buf = Buffer.from(str);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const box = nacl.box(buf, nonce, theirPublicKey, this._key.secretKey);

    const fullBuf = new Uint8Array(box.length + nacl.box.nonceLength);
    fullBuf.set(nonce);
    fullBuf.set(box, nacl.box.nonceLength);
    return Buffer.from(fullBuf).toString('base64')
  }

  /**
    get data from a local app.  apps can decide whether or not to encrypt their contents

    @param {string} key the key used to store a value in the app
    @param {object} options to specify:
    - {bool} `encrypted` flag indicating whether or not the value is box encrypted. Default false.
    - {string} `appId` the name of the app. Same app by default.
    @return {string} the value returned by the local app
   */
  async get(key, options) {
    options = Object.assign({
      encrypted: false,  // not supported yet
      appId: this.appId,
    }, options);
    let str = await this._contract.get({
      app_id: options.appId,
      key,
    });
    if (str) {
      str = JSON.parse(options.encrypted ? this.decryptSecretBox(str) : str);
    }
    return str;
  }

  /**
    get a value from a remote app installed on another account

    @param {string} accountId account from which to get a value
    @param {string} key the key to use to identify the value
    @param {object} options to specify:
     - {bool} `encrypted` flag indicating whether or not the value is box encrypted. Default false.
     - {string} `appId` the name of the app. Same app by default.
    @return {string} the value returned from the remote app
   */
  async getFrom(accountId, key, options) {
    options = Object.assign({
      encrypted: false,  // not supported yet
      appId: this.appId,
    }, options);
    const account = new nearlib.Account(this._near.connection, accountId);
    const contract = new nearlib.Contract(account, accountId, {
      viewMethods: ['get'],
      changeMethods: [],
      sender: this.accountId
    });

    let str = await contract.get({
      app_id: options.appId,
      key,
    });
    if (str) {
      str = JSON.parse(options.encrypted ? this.decryptSecretBox(str) : str);
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
    @param {object} options to specify:
      - {bool} `encrypted` flag indicating whether to encrypt (box) the value. Default false.
   */
  async set(key, value, options) {
    await this.forceReady();
    options = Object.assign({
      encrypted: false,
    }, options);
    await this.wrappedCall(() => this._contract.set({
      key,
      value: options.encrypted ? this.encryptSecretBox(JSON.stringify(value)) : JSON.stringify(value),
    }, GAS));
  }

  /**
    remove a key-value pair from local storage

    @param {string} key key to be removed
   */
  async remove(key) {
    await this.forceReady();
    await this.wrappedCall(() => this._contract.remove({
      key,
    }, GAS));
  }

  /**
    retrieve a message

    @return {any} return async? pull from local storage, null if not found
   */
  async pullMessage(options) {
    await this.forceReady();
    if (await this._contract.num_messages({app_id: this.appId}) > 0) {
      return await this.wrappedCall(() => this._contract.pull_message({}, GAS));
    } else {
      return null;
    }
  }

  async getTheirPublicKey(options) {
    await this.forceReady();
    options = Object.assign({
      accountId: null,
      theirPublicKey: null,
      theirPublicKey64: null,
      encryptionKey,
      appId: this.appId,
    }, options);
    if (options.theirPublicKey) {
      return options.theirPublicKey;
    }
    if (!options.theirPublicKey64) {
      if (!options.accountId) {
        throw new Error("Either accountId or theirPublicKey64 has to be provided");
      }
      options.theirPublicKey64 = await this.getFrom(options.accountId, options.encryptionKey, {
        appId: options.appId,
      });
    }
    if (!options.theirPublicKey64) {
      throw new Error("Their app doesn't provide the encryption public key.");
    }
    const buf = Buffer.from(options.theirPublicKey64, 'base64');
    if (buf.length != nacl.box.publicKeyLength) {
      throw new Error("Their encryption public key is invalid.");
    }
    const theirPublicKey = new Uint8Array(nacl.box.publicKeyLength);
    theirPublicKey.set(buf);
    return theirPublicKey;
  }

  /**
   * Encrypts given content. Typical usage: encryptMessage("hello world", {accountId: bla})
   *
   * @param {string} content The message to encrypt
   * @param options
   * @returns {Promise<string>}
   */
  async encryptMessage(content, options) {
    await this.forceReady();
    const theirPublicKey = await this.getTheirPublicKey(options);
    return this.encryptBox(content, theirPublicKey);
  }

  async decryptMessage(msg64, options) {
    await this.forceReady();
    const theirPublicKey = await this.getTheirPublicKey(options);
    return this.decryptBox(msg64, theirPublicKey);
  }

  /**
    send a message to another account

    @param {string} receiverId account id which will receive the message
    @param {string} message the content of the message
    @param {object} options to specify:
      - {string} `appId` the app ID to receive the message. Same app by default.
   */
  async sendMessage(receiverId, message, options) {
    this.forceReady();
    options = Object.assign({
      appId: this.appId,
    }, options);
    await this.wrappedCall(() => this._contract.send_message({
      receiver_id: receiverId,
      app_id: options.appId,
      message,
    }, GAS));
  }
}
