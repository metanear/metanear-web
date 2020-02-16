import React from "react";
import anon from "../../assets/anon.png";
import {OpenWebApp} from "../../openweb/openweb";

const profileAppId = "profile";

export class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: "",
      profileUrl: null,
      loading: true,
      found: false,
    }
    if (!window.profileComponentCache) {
      window.profileComponentCache = {
        profileCache: {},
        app: new OpenWebApp(profileAppId, null, window.nearConfig),
      };
      window.profileComponentCache.app.init();
    }

    this.profileCache = window.profileComponentCache.profileCache;
    this.app = window.profileComponentCache.app;
    this.updateProfile(this.props.accountId);
  }

  async fetchProfile(accountId) {
    if (accountId in this.profileCache) {
      return await this.profileCache[accountId];
    } else {
      console.log("Fetching profile for " + accountId);
      this.profileCache[accountId] = Promise.all([
        this.app.getFrom(accountId, 'displayName'),
        this.app.getFrom(accountId, 'profileUrl'),
      ]).then((values) => {
        return {
          displayName: values[0] || "",
          profileUrl: values[1],
          loading: false,
        };
      }).catch((e) => false);
      return await this.profileCache[accountId];
    }
  }

  updateProfile(accountId) {
    this.setState({
      displayName: "",
      profileUrl: null,
      loading: true,
      found: false,
    });
    this.fetchProfile(this.props.accountId).then((profile) => {
      if (profile) {
        this.setState({
          displayName: profile.displayName,
          profileUrl: profile.profileUrl,
          loading: false,
          found: true,
        });
      } else {
        this.setState({
          loading: false,
          found: false,
        });
      }
    })

  }

  componentDidUpdate(prevProps) {
    if (this.props.accountId !== prevProps.accountId) {
      this.updateProfile(this.props.accountId);
    }
  }

  render() {
    return this.state.loading ? (
      <div className="profile">
        <div className="spinner-grow" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    ) : this.state.found ? (
      <div className="profile">
        <img className="profile-image" src={this.props.profileUrl || this.state.profileUrl || anon}/>
        <span className="profile-name">
          <span className="profile-display-name">{this.props.displayName || this.state.displayName}</span>
          <span className="profile-account-id">{"(@" + this.props.accountId + ")"}</span>
        </span>
      </div>
    ) : null;
  }
}
