import React from 'react';
import ReactDOM from 'react-dom';
import Router from './Router';
import * as nearlib from 'nearlib';

// Initializing contract
async function InitContract() {
    window.nearConfig = {
        networkId: 'default',
        nodeUrl: 'https://rpc.nearprotocol.com',
        walletUrl: 'https://wallet.nearprotocol.com',
    };

    // Initializing connection to the NEAR DevNet.
    window.near = await nearlib.connect(Object.assign({ deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() } }, window.nearConfig));

    // Needed to access wallet login
    window.walletAccount = new nearlib.WalletAccount(window.near);

    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletAccount.getAccountId();

}

window.nearInitPromise = InitContract().then(() => {
    ReactDOM.render(<Router contract={window.contract} wallet={window.walletAccount}/>,
      document.getElementById('root')
    );
  }).catch(console.error)
