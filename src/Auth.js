import React from "react";
import queryString from 'query-string';

export class Auth extends React.Component {
  constructor(props) {
    super(props);
    const values = queryString.parse(this.props.location.search);
    let {app_id, pub_key} = values;
    if (app_id && pub_key) {
      this.state = {
        authorized:false,
        new_app_id:app_id,
        new_pub_key:pub_key
      };
    } else {
      this.state = {
        authorized:false,
        new_app_id:"",
        new_pub_key:""
      }
    }
  }

 componentDidMount() {
    if (!this.props.loading && this.state.new_app_id && this.state.new_pub_key) {
      this.props.initOpenWebApp(this.state.new_app_id, this.state.new_pub_key)
        .then(res => {
          this.setState({
            authorized: true
          })
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.app && !this.state.initialized) {
      // this.init();
    }
  }
  
  // async fetchProfile(accountId) {
  //   if (accountId in this.profileCache) {
  //     return this.profileCache[accountId];
  //   } else {
  //     console.log("Fetching profile for " + accountId);
  //     try {
  //       const values = await Promise.all([
  //         this.props.app.getFrom(accountId, 'displayName', 'profile'),
  //         this.props.app.getFrom(accountId, 'profileUrl', 'profile'),
  //       ]);
  //       this.profileCache[accountId] = {
  //         displayName: values[0] || "",
  //         profileUrl: values[1],
  //       };
  //     } catch (e) {
  //       this.profileCache[accountId] = false;
  //     }
  //     return this.profileCache[accountId];
  //   }
  // }

  // async registerNewApp(accountId) {
  //   if (accountId in this.profileCache) {
  //     return this.profileCache[accountId];
  //   } else {
  //     console.log("Fetching profile for " + accountId);
  //     try {
  //       const values = await Promise.all([
  //         this.props.app.getFrom(accountId, 'displayName', 'profile'),
  //         this.props.app.getFrom(accountId, 'profileUrl', 'profile'),
  //       ]);
  //       this.profileCache[accountId] = {
  //         displayName: values[0] || "",
  //         profileUrl: values[1],
  //       };
  //     } catch (e) {
  //       this.profileCache[accountId] = false;
  //     }
  //     return this.profileCache[accountId];
  //   }
  // }

  render() {
    return (
      <div>
        {this.state.authorized ? 
        <div>
          <p>App <strong>{this.state.new_app_id}</strong> was added</p>
          <p> Using the public key: {this.state.new_pub_key} </p>
        </div> :
        "You need pass a key in order to add an app"
        }
      </div>
    )
  }
}
