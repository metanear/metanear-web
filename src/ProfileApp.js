import React from "react";
import anon from "./assets/anon.png";


export class ProfileApp extends React.Component {
  constructor(props) {
    super(props);
    const keys = [
      "displayName",
      "profileUrl",
      "bio",
    ];
    this.state = keys.reduce((acc, key) => {
      acc[key] = "";
      acc.chainValues[key] = null;
      return acc;
    }, {
      keys,
      chainValues: {},
      initialized: false,
    });
  }

  async init() {
    console.log("init profile");
    this.setState({
      initialized: true,
    });
    const values = await Promise.all(this.state.keys.map((key) => this.props.app.get(key)));
    console.log(values);
    const chainValues = this.state.keys.reduce((acc, key, i) => {
      acc[key] = values[i] || "";
      return acc;
    }, {});
    this.setState(Object.assign({chainValues}, chainValues));
  }

  componentDidUpdate(prevProps) {
    if (this.props.app && !this.state.initialized) {
      this.init();
    }
  }

  handleChange(key, value) {
    this.setState({
      [key]: value,
    });
  }

  async save() {
    console.log("Saving");
    const chainValues = Object.assign({}, this.state.chainValues);
    this.state.keys.forEach(key => {
      if (this.state.chainValues[key] !== this.state[key]) {
        chainValues[key] = this.state[key];
        this.props.app.set(key, this.state[key]).then(() => {
          console.log("Updated key `" + key + "` to value `" + this.state[key] + '`');
        });
      }
    });
    this.setState({
      chainValues
    })
  }

  render() {
    return (
      <div>
        <div>
          <img className="profile-image" src={this.state.profileUrl || anon}/>
          <span className="letter-expanded-profile">
            <span className="letter-profile-name">{this.state.displayName}</span>
            {this.props.app && <span className="letter-account-id">{"(@" + this.props.app.accountId + ")"}</span>}
          </span>
        </div>
        <hr/>
        <div>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input placeholder="The REAL Satoshi" id="displayName" className="form-control" disabled={!this.props.app} value={this.state.displayName} onChange={(e) => this.handleChange('displayName', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="profileUrl">Profile URL</label>
            <input placeholder={"https://metanear.com" + anon} id="profileUrl" className="form-control" disabled={!this.props.app} value={this.state.profileUrl}
                   onChange={(e) => this.handleChange('profileUrl', e.target.value)}/>
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea placeholder="I'm working on Bitcoin, so bankers can go home." id="bio" className="form-control" disabled={!this.props.app} value={this.state.bio} onChange={(e) => this.handleChange('bio', e.target.value)} />
          </div>
          <div className="form-group">
            <button onClick={() => this.save()}>Save changes</button>
          </div>
        </div>
      </div>
    )
  }
}