import React from "react";

const Status = {
  Initializing: "initializing",
  Ready: "ready",
  OtherKey: "otherKey",
  RequestedKey: "requestedKey",
};

const RequestStatus = {
  NotStarted: "notStarted",
  Pending: "pending",
  Declined: "declined",
  Invalid: "invalid",
  Approved: "approved",
}

const masterKeyRequest = "masterKeyRequest";

export class KeysApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      appReady: false,
      status: Status.Initializing,
      keyRequest: null,
      requestMessage: "",
      sendingRequest: false,
      forceShowRequestMessage: false,
    };
  }

  async init() {
    this.setState({
      appReady: true,
    });
    const app = this.props.app;
    const currentKey = await app.getStoredEncryptionPublicKey(null, {});
    const myKey = app.getEncryptionPublicKey();
    if (currentKey == null) {
      await app.storeEncryptionPublicKey();
      this.setState({
        status: Status.Ready,
      });
    } else if (currentKey !== myKey) {
      await this.checkRequestStatus();
    } else {
      // same key
      this.setState({
        status: Status.Ready,
      });
    }
  }

  async checkRequestStatus() {
    const app = this.props.app;
    const currentKey = await app.getStoredEncryptionPublicKey(null, {});
    const myKey = app.getEncryptionPublicKey();
    // Already have a key. Need to make a key request.
    const requestKey = `request:${myKey}`;
    let requestStatus = await app.get(requestKey) || RequestStatus.NotStarted;
    if (requestStatus === RequestStatus.Approved) {
      try {
        const responseKey = `request:${myKey}`;
        const response = await app.get(responseKey);
        const currentSecretKey = await app.decryptMessage(response, {
          theirPublicKey64: currentKey,
        });
        app.updateEncryptionKey(currentSecretKey);
        await app.remove(responseKey);
        await app.remove(requestKey);
        this.setState({
          status: Status.Ready,
        });
        return;
      } catch (e) {
        console.log("Failed to decrypt response:", e);
        requestStatus = RequestStatus.Invalid;
      }
    }
    this.setState({
      status: Status.OtherKey,
      keyRequest: {
        requestStatus,
        myKey,
        currentKey,
      }
    });
  }

  maybeInit() {
    if (this.props.app && !this.state.initialized) {
      this.setState({
        initialized: true,
      });
      this.props.app.waitReady().then(() => this.init());
    }
  }

  componentDidMount() {
    this.maybeInit()
  }

  componentDidUpdate(prevProps) {
    this.maybeInit()
  }

  handleChange(key, value) {
    const stateChange = {
      [key]: value,
    };
    this.setState(stateChange);
  }

  async makeKeyRequest() {
    this.setState({
      sendingRequest: true,
    });
    const app = this.props.app;
    const keyRequest = this.state.keyRequest;
    const requestKey = `request:${keyRequest.myKey}`;
    console.log(requestKey);
    await app.set(requestKey, RequestStatus.Pending);
    await app.sendMessage(app.accountId, JSON.stringify({
      type: masterKeyRequest,
      key: keyRequest.myKey,
      message: await app.encryptMessage(this.state.requestMessage, {
        theirPublicKey64: keyRequest.currentKey,
      })
    }));
    this.setState({
      keyRequest: Object.assign({}, keyRequest, {
        requestStatus: RequestStatus.Pending,
      }),
      sendingRequest: false,
      forceShowRequestMessage: false,
    })
  }

  render() {
    if (!this.state.appReady) {
      return <div>App is preparing...</div>;
    }
    if (this.state.status === Status.Initializing) {
      return <div>Initializing...</div>;
    }
    if (this.state.status === Status.OtherKey) {
      const alert =(
        <div className="alert alert-danger" role="alert">
          The app has a different encryption key!
        </div>
      );
      const showRequest = this.state.keyRequest.requestStatus === RequestStatus.NotStarted || this.state.forceShowRequestMessage;
      const newRequest = (
        <div>
          <label htmlFor="request-message">Request the encryption key from another device:</label>
          <div className="input-group">
            <input
              placeholder={"Enter a personalized message, e.g. \"It's me from mobile\""}
              id="request-message"
              className="form-control"
              value={this.state.requestMessage}
              onChange={(e) => this.handleChange('requestMessage', e.target.value)}/>
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                disabled={this.state.sendingRequest || !this.state.requestMessage}
                onClick={() => this.makeKeyRequest()}
              >
                {this.state.sendingRequest && (
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                )} Request
              </button>
            </div>
          </div>
        </div>
      );
      const showPendingRequest = this.state.keyRequest.requestStatus === RequestStatus.Pending;
      const pendingRequest = (
        <div>
          You've already sent a request. Open it on another authorized device to approve this request.
          <div>
            <button className="btn btn-primary" onClick={() => this.checkRequestStatus()}>Refresh</button>
            <button className="btn btn-secondary" onClick={() => this.setState({forceShowRequestMessage: true})}>Request again</button>
          </div>
        </div>
      );
      return (
        <div>
          {alert}
          {showPendingRequest && pendingRequest}
          {showRequest && newRequest}
        </div>
      );
    }
    if (this.state.status === Status.OtherKey) {

    }
    return (
      <div>
        <h3>Key management is here</h3>
      </div>
    )
  }
}
