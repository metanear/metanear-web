(this["webpackJsonpnear-open-web-frontend"]=this["webpackJsonpnear-open-web-frontend"]||[]).push([[0],{114:function(e,t){},120:function(e,t){},141:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),s=n(0),o=n.n(s),i=n(68),c=n.n(i),l=n(32),u=n(11),p=n(12),d=n(17),h=n(16),m=n(19),f=n(18),g=n(69),w=n.n(g),v=(n(77),n(3)),y=function(){function e(t,n,a){Object(u.a)(this,e),this.appId=t,this.accountId=n,this._config=a,this.blocking=Promise.resolve()}return Object(p.a)(e,[{key:"init",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return this._keyStore=new v.keyStores.BrowserLocalStorageKeyStore(localStorage,"app:"+this.appId),e.next=3,r.a.awrap(v.connect(Object.assign({deps:{keyStore:this._keyStore}},this._config)));case 3:this._near=e.sent,this._account=new v.Account(this._near.connection,this.accountId),this._contract=new v.Contract(this._account,this.accountId,{viewMethods:["get","apps","num_messages"],changeMethods:["set","remove","pull_message","send_message"],sender:this.accountId}),this._networkId=this._config.networkId;case 7:case"end":return e.stop()}}),null,this)}},{key:"ready",value:function(){var e;return r.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.a.awrap(this._keyStore.getKey(this._networkId,this.accountId));case 2:return e=t.sent,t.abrupt("return",!!e);case 4:case"end":return t.stop()}}),null,this)}},{key:"getPublicKey",value:function(){var e,t;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,r.a.awrap(this._keyStore.getKey(this._networkId,this.accountId));case 2:if(!(e=n.sent)){n.next=5;break}return n.abrupt("return",e.getPublicKey());case 5:if(!this._tmpKey){n.next=7;break}return n.abrupt("return",this._tmpKey.getPublicKey());case 7:return t=v.KeyPair.fromRandom("ed25519"),this._tmpKey=t,n.abrupt("return",t.getPublicKey());case 10:case"end":return n.stop()}}),null,this)}},{key:"onKeyAdded",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:if(this._tmpKey){e.next=2;break}throw new Error("The key is not initialized yet");case 2:return e.next=4,r.a.awrap(this._keyStore.setKey(this._networkId,this.accountId,this._tmpKey));case 4:this._tmpKey=null;case 5:case"end":return e.stop()}}),null,this)}},{key:"forceReady",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.a.awrap(this.ready());case 2:if(e.sent){e.next=4;break}throw new Error("Not ready yet");case 4:case"end":return e.stop()}}),null,this)}},{key:"wrappedCall",value:function(e){return this.blocking=this.blocking.then((function(){return e()})).catch((function(){return e()})),this.blocking}},{key:"get",value:function(e,t){var n;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return t=t||this.appId,a.next=3,r.a.awrap(this._contract.get({app_id:t,key:e}));case 3:return(n=a.sent)&&(n=JSON.parse(n)),a.abrupt("return",n);case 6:case"end":return a.stop()}}),null,this)}},{key:"getFrom",value:function(e,t,n){var a,s,o;return r.a.async((function(i){for(;;)switch(i.prev=i.next){case 0:return n=n||this.appId,a=new v.Account(this._near.connection,e),s=new v.Contract(a,e,{viewMethods:["get"],changeMethods:[],sender:this.accountId}),i.next=5,r.a.awrap(s.get({app_id:n,key:t}));case 5:return(o=i.sent)&&(o=JSON.parse(o)),i.abrupt("return",o);case 8:case"end":return i.stop()}}),null,this)}},{key:"apps",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.a.awrap(this._contract.apps());case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),null,this)}},{key:"set",value:function(e,t){var n=this;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return this.forceReady(),a.next=3,r.a.awrap(this.wrappedCall((function(){return n._contract.set({key:e,value:JSON.stringify(t)},2e15)})));case 3:case"end":return a.stop()}}),null,this)}},{key:"remove",value:function(e){var t=this;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return this.forceReady(),n.next=3,r.a.awrap(this.wrappedCall((function(){return t._contract.remove({key:e},2e15)})));case 3:case"end":return n.stop()}}),null,this)}},{key:"pullMessage",value:function(){var e=this;return r.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:return this.forceReady(),t.next=3,r.a.awrap(this._contract.num_messages({app_id:this.appId}));case 3:if(t.t0=t.sent,!(t.t0>0)){t.next=10;break}return t.next=7,r.a.awrap(this.wrappedCall((function(){return e._contract.pull_message({},2e15)})));case 7:return t.abrupt("return",t.sent);case 10:return t.abrupt("return",null);case 11:case"end":return t.stop()}}),null,this)}},{key:"sendMessage",value:function(e,t,n){var a=this;return r.a.async((function(s){for(;;)switch(s.prev=s.next){case 0:return this.forceReady(),e=e||this.accountId,n=n||this.appId,s.next=5,r.a.awrap(this.wrappedCall((function(){return a._contract.send_message({receiver_id:e,app_id:n,message:t},2e15)})));case 5:case"end":return s.stop()}}),null,this)}}]),e}(),b=n(31),k=function(e){function t(e){var n;Object(u.a)(this,t);var a=["displayName","profileUrl","bio"];return(n=Object(d.a)(this,Object(h.a)(t).call(this,e))).state=a.reduce((function(e,t){return e[t]="",e.chainValues[t]=null,e}),{keys:a,chainValues:{},initialized:!1}),n}return Object(f.a)(t,e),Object(p.a)(t,[{key:"init",value:function(){var e,t,n=this;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return console.log("init"),this.setState({initialized:!0}),a.next=4,r.a.awrap(Promise.all(this.state.keys.map((function(e){return n.props.app.get(e)}))));case 4:e=a.sent,console.log(e),t=this.state.keys.reduce((function(t,n,a){return t[n]=e[a]||"",t}),{}),this.setState(Object.assign({chainValues:t},t));case 8:case"end":return a.stop()}}),null,this)}},{key:"componentDidUpdate",value:function(e){this.props.app&&!this.state.initialized&&this.init()}},{key:"handleChange",value:function(e,t){this.setState(Object(b.a)({},e,t))}},{key:"save",value:function(){var e,t=this;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:console.log("Saving"),e=Object.assign({},this.state.chainValues),this.state.keys.forEach((function(n){t.state.chainValues[n]!==t.state[n]&&(e[n]=t.state[n],t.props.app.set(n,t.state[n]).then((function(){console.log("Updated key `"+n+"` to value `"+t.state[n]+"`")})))})),this.setState({chainValues:e});case 4:case"end":return n.stop()}}),null,this)}},{key:"render",value:function(){var e=this;return o.a.createElement("div",null,o.a.createElement("div",{className:"form-group"},o.a.createElement("label",{htmlFor:"displayName"},"Display Name"),o.a.createElement("input",{id:"displayName",className:"form-control",disabled:!this.props.app,value:this.state.displayName,onChange:function(t){return e.handleChange("displayName",t.target.value)}})),o.a.createElement("div",{className:"form-group"},o.a.createElement("label",{htmlFor:"profileUrl"},"Profile URL"),o.a.createElement("input",{id:"profileUrl",className:"form-control",disabled:!this.props.app,value:this.state.profileUrl,onChange:function(t){return e.handleChange("profileUrl",t.target.value)}}),o.a.createElement("img",{src:this.state.profileUrl,className:"img-thumbnail rounded-circle w-25"})),o.a.createElement("div",{className:"form-group"},o.a.createElement("label",{htmlFor:"bio"},"Bio"),o.a.createElement("textarea",{id:"bio",className:"form-control",disabled:!this.props.app,value:this.state.bio,onChange:function(t){return e.handleChange("bio",t.target.value)}})),o.a.createElement("div",{className:"form-group"},o.a.createElement("button",{onClick:function(){return e.save()}},"Save changes")))}}]),t}(o.a.Component),x=n(37),E=n.n(x),N=function(e){function t(e){var n;return Object(u.a)(this,t),(n=Object(d.a)(this,Object(h.a)(t).call(this,e))).state={initialized:!1,receiverId:"",subject:"",content:"",sending:!1,profileFetchTimeoutId:null,profileFetchIndex:0,numLetters:0,unread:0,expandedId:-1,inbox:[]},n.textarea=o.a.createRef(),n.profileCache={},n}return Object(f.a)(t,e),Object(p.a)(t,[{key:"modifyLetter",value:function(e,t){if(void 0===t){if(!e)return;t=e.messageId}var n=this.state.inbox.filter((function(e){return e.messageId!=t}));e&&n.push(e),n.sort((function(e,t){return t.time-e.time}));var a=n.reduce((function(e,t){return e+(t.read?0:1)}),0);this.setState({inbox:n,unread:a}),this.props.onNewMail(a)}},{key:"init",value:function(){var e=this;return r.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:console.log("init"),this.setState({initialized:!0}),this.props.app.get("numLetters").then((function(t){t=t||0,e.setState({numLetters:t});for(var n=Math.max(0,t-10);n<t;++n)e.props.app.get("letter_"+n).then((function(t){return e.modifyLetter(t)}));e.fetchMessages()}));case 3:case"end":return t.stop()}}),null,this)}},{key:"componentDidUpdate",value:function(e){this.props.app&&!this.state.initialized&&this.init()}},{key:"fetchProfile",value:function(e){var t;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:if(!(e in this.profileCache)){n.next=4;break}return n.abrupt("return",this.profileCache[e]);case 4:return console.log("Fetching profile for "+e),n.prev=5,n.next=8,r.a.awrap(Promise.all([this.props.app.getFrom(e,"displayName","profile"),this.props.app.getFrom(e,"profileUrl","profile")]));case 8:t=n.sent,this.profileCache[e]={displayName:t[0]||"",profileUrl:t[1]},n.next=15;break;case 12:n.prev=12,n.t0=n.catch(5),this.profileCache[e]=!1;case 15:return n.abrupt("return",this.profileCache[e]);case 16:case"end":return n.stop()}}),null,this,[[5,12]])}},{key:"handleChange",value:function(e,t){var n=this,a=Object(b.a)({},e,t);if("receiverId"===e){var r=this.state.profileFetchIndex+1;a.profileFetchIndex=r,a.profile=null,t?(a.profileLoading=!0,this.fetchProfile(t).then((function(e){n.state.profileFetchIndex===r&&n.setState({profileLoading:!1,profile:e})}))):a.profileLoading=!1}this.setState(a)}},{key:"fetchMessages",value:function(){var e=this;this.props.app&&(this.fetchTimeoutId&&(clearTimeout(this.fetchTimeoutId),this.fetchTimeoutId=null),console.log("Fetching messages"),this.props.app.pullMessage().then((function(t){if(t)try{console.log(t);var n=JSON.parse(t.message);if("mail"===n.type){var a={messageId:e.state.numLetters,sender:t.sender,subject:n.subject,content:n.content,time:Math.trunc(t.time/1e6)},r=e.state.numLetters+1;e.setState({numLetters:r}),e.props.app.set("letter_"+a.messageId,a).then((function(){console.log("Saved the letter: ",a)})),e.props.app.set("numLetters",r).then((function(){console.log("Saved the new number of letters: ",r)})),e.modifyLetter(a)}else console.warn("Unknown message",t)}catch(s){console.error(s)}finally{e.fetchMessages()}else e.fetchTimeoutId=setTimeout((function(){e.fetchMessages()}),6e4)})))}},{key:"sendMail",value:function(){var e=this;this.state.profile&&(console.log("Sending mail"),this.setState({sending:!0}),this.props.app.sendMessage(this.state.receiverId,JSON.stringify({type:"mail",subject:this.state.subject,content:this.state.content})).then((function(){e.setState({subject:"",content:""})})).finally((function(){e.setState({sending:!1}),e.fetchMessages()})))}},{key:"receiverClass",value:function(){return!this.state.receiverId||this.state.profileLoading?"form-control":this.state.profile?"form-control is-valid":"form-control is-invalid"}},{key:"replyTo",value:function(e,t){this.handleChange("receiverId",e.sender),this.setState({subject:(e.subject.startsWith("Re: ")?"":"Re: ")+e.subject,content:["","",["On",new Date(e.time).toLocaleDateString(),t,"@"+e.sender,"wrote:"].join(" ")].concat(Object(l.a)(e.content.split(/\r?\n/).map((function(e){return"| "+e})))).join("\n")}),this.textarea.current.focus()}},{key:"selectLetter",value:function(e){this.setState({expandedId:this.state.expandedId===e.messageId?-1:e.messageId}),e.read||((e=JSON.parse(JSON.stringify(e))).read=!0,this.props.app.set("letter_"+e.messageId,e).then((function(){console.log("Saved the letter: ",e)})),this.modifyLetter(e))}},{key:"deleteLetter",value:function(e){this.props.app.remove("letter_"+e.messageId).then((function(){console.log("Deleted the letter: ",e)})),this.modifyLetter(null,e.messageId)}},{key:"render",value:function(){var e=this,t=this.state.profileLoading?o.a.createElement("div",{className:"col"},o.a.createElement("div",{className:"spinner-grow",role:"status"},o.a.createElement("span",{className:"sr-only"},"Loading..."))):this.state.profile?o.a.createElement("div",{className:"col"},o.a.createElement("img",{className:"profile-image",src:this.state.profile.profileUrl||E.a}),o.a.createElement("span",{className:"profile-name"},this.state.profile.displayName)):null,n=this.state.inbox.map((function(t,n){return o.a.createElement(I,{key:t.messageId,fetchProfile:function(t){return e.fetchProfile(t)},letter:t,expanded:t.messageId==e.state.expandedId,deleteLetter:function(t){return e.deleteLetter(t)},replyTo:function(t,n){return e.replyTo(t,n)},selectLetter:function(t){return e.selectLetter(t)}})}));return o.a.createElement("div",null,"Inbox ",o.a.createElement("button",{className:"btn btn-sm",onClick:function(){return e.fetchMessages()}},"\ud83d\udd04"),o.a.createElement("div",null,n),o.a.createElement("h3",null,"Send"),o.a.createElement("div",{className:"form-row"},o.a.createElement("div",{className:"col"},o.a.createElement("div",{className:"form-group"},o.a.createElement("label",{className:"sr-only",htmlFor:"toAccountId"},"To Account ID"),o.a.createElement("div",{className:"input-group"},o.a.createElement("div",{className:"input-group-prepend"},o.a.createElement("div",{className:"input-group-text"},"@")),o.a.createElement("input",{type:"text",className:this.receiverClass(),id:"toAccountId",placeholder:"To Account ID",value:this.state.receiverId,disabled:!this.props.app,onChange:function(t){return e.handleChange("receiverId",t.target.value)}})))),t),o.a.createElement("div",{className:"form-group"},o.a.createElement("label",{className:"sr-only",htmlFor:"subject"},"Subject"),o.a.createElement("input",{type:"text",className:"form-control",id:"subject",placeholder:"Subject",disabled:!this.props.app,value:this.state.subject,onChange:function(t){return e.handleChange("subject",t.target.value)}})),o.a.createElement("div",{className:"form-group"},o.a.createElement("textarea",{ref:this.textarea,id:"content",className:"form-control",rows:"7",disabled:!this.props.app,value:this.state.content,onChange:function(t){return e.handleChange("content",t.target.value)}})),o.a.createElement("div",{className:"form-group"},o.a.createElement("button",{className:"form-control form-control-lg btn btn-primary",disabled:!this.state.profile||this.state.sending,onClick:function(){return e.sendMail()}},"Send")))}}]),t}(o.a.Component),I=function(e){function t(e){var n;return Object(u.a)(this,t),(n=Object(d.a)(this,Object(h.a)(t).call(this,e))).state={profile:{profileUrl:null,displayName:"@"+e.letter.sender}},n}return Object(f.a)(t,e),Object(p.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.props.fetchProfile(this.props.letter.sender).then((function(t){e.setState({profile:t})}))}},{key:"onClick",value:function(){this.props.selectLetter(this.props.letter)}},{key:"render",value:function(){var e=this,t=this.props.expanded?o.a.createElement("span",{className:"letter-expanded-profile"},o.a.createElement("span",{className:"letter-profile-name"},this.state.profile.displayName),o.a.createElement("span",{className:"letter-account-id"},"(@"+this.props.letter.sender+")")):o.a.createElement("span",{className:"letter-profile-name"},this.state.profile.displayName),n=o.a.createElement("div",{className:"col-sm-6 col-md-4 col-lg-3 letter-profile"},o.a.createElement("img",{className:"letter-profile-image",src:this.state.profile.profileUrl||E.a}),t),a=o.a.createElement("div",{className:"col-sm-4 col-md"},o.a.createElement("div",{className:"letter-subject"},this.props.letter.subject)),r=o.a.createElement("div",{className:"col-sm-2 col-lg-1"+(this.props.expanded?"":" d-none d-md-block")},o.a.createElement("div",{className:"letter-time"},function(e){var t=new Date(e);if((new Date).getDate()===t.getDate()){var n=t.getHours()%12,a=t.getMinutes().toString().padStart(2,"0"),r=t.getHours()>=12?"PM":"AM";return"".concat(n,":").concat(a," ").concat(r)}return t.toLocaleDateString()}(this.props.letter.time)));return this.props.expanded?o.a.createElement("div",{className:"letter letter-expanded"},o.a.createElement("div",{className:"row letter-expanded-header",onClick:function(){return e.onClick()}},n,a,r),o.a.createElement("div",{className:"letter-content-expanded"},o.a.createElement("pre",null,this.props.letter.content),o.a.createElement("div",{className:"row"},o.a.createElement("div",{className:"col-xs"},o.a.createElement("button",{className:"btn btn-primary",onClick:function(){return e.props.replyTo(e.props.letter,e.state.profile.displayName)}},"Reply")),o.a.createElement("div",{className:"col-xs"},o.a.createElement("button",{className:"btn btn-danger float-right",onClick:function(){return e.props.deleteLetter(e.props.letter)}},"DELETE THIS!"))))):o.a.createElement("div",{className:"row letter letter-small"+(this.props.letter.read?" letter-read":" letter-unread"),onClick:function(){return e.onClick()}},n,a,o.a.createElement("div",{className:"col-sm d-none d-lg-block"},o.a.createElement("div",{className:"letter-content"},this.props.letter.content)),r)}}]),t}(o.a.Component);var S=n(20),C=(n(139),function(e){function t(e){var n;return Object(u.a)(this,t),(n=Object(d.a)(this,Object(h.a)(t).call(this,e))).requestSignOut=function(){n.props.wallet.signOut(),setTimeout(n.signedOutFlow,500),console.log("after sign out",n.props.wallet.isSignedIn())},n.signedOutFlow=function(){window.location.search.includes("account_id")&&window.location.replace(window.location.origin+window.location.pathname),n.setState({login:!1})},n.state={login:!1,apps:{},unread:0},n.signedInFlow=n.signedInFlow.bind(Object(m.a)(n)),n.requestSignIn=n.requestSignIn.bind(Object(m.a)(n)),n.requestSignOut=n.requestSignOut.bind(Object(m.a)(n)),n.signedOutFlow=n.signedOutFlow.bind(Object(m.a)(n)),window.nearlib=v,n}return Object(f.a)(t,e),Object(p.a)(t,[{key:"componentDidMount",value:function(){window.walletAccount.isSignedIn()?this.signedInFlow():this.signedOutFlow()}},{key:"signedInFlow",value:function(){var e,t,n,a,s,o,i,c;return r.a.async((function(l){for(;;)switch(l.prev=l.next){case 0:return console.log("come in sign in flow"),l.next=3,r.a.awrap(this.props.wallet.getAccountId());case 3:return e=l.sent,this.setState({login:!0,accountId:e}),window.location.search.includes("account_id")&&window.location.replace(window.location.origin+window.location.pathname),window.location.search.includes("all_keys")&&window.location.replace(window.location.origin+window.location.pathname),console.log("Connecting to account..."),l.next=10,r.a.awrap(new v.Account(window.near.connection,e));case 10:return t=l.sent,console.log("Querying state..."),l.next=14,r.a.awrap(t.state());case 14:if(n=l.sent,console.log(n),"CbG5c4viMES2C47pc8SYWGc4F8W4EBSzD4RLjVqTPDR6"===n.code_hash){l.next=39;break}return console.log("Going to deploy the code"),console.log("Downloading started..."),l.next=21,r.a.awrap(fetch("/open_web.wasm"));case 21:return a=l.sent,l.next=24,r.a.awrap(a.arrayBuffer());case 24:return s=l.sent,console.log("Downloading done. Deploying contract..."),l.next=28,r.a.awrap(t.deployContract(new Uint8Array(s)));case 28:if("11111111111111111111111111111111"!==n.code_hash){l.next=38;break}return console.log("Deploying done. Initializing contract..."),l.next=32,r.a.awrap(new v.Contract(t,e,{viewMethods:[],changeMethods:["new"],sender:e}));case 32:return o=l.sent,l.t0=console,l.next=36,r.a.awrap(o.new());case 36:l.t1=l.sent,l.t0.log.call(l.t0,l.t1);case 38:console.log("Done");case 39:return l.next=41,r.a.awrap(new v.Contract(t,e,{viewMethods:["apps"],changeMethods:["add_app_key","remove_app_key"],sender:e}));case 41:return i=l.sent,this.masterContract=i,window.masterContract=i,console.log("Fetching authorized apps..."),l.t2=console,l.next=48,r.a.awrap(i.apps());case 48:return l.t3=l.sent,l.t2.log.call(l.t2,"Apps:",l.t3),console.log("Initializing local apps..."),l.next=53,r.a.awrap(this.initOpenWebApp("profile",e));case 53:return l.t4=l.sent,l.next=56,r.a.awrap(this.initOpenWebApp("graph",e));case 56:return l.t5=l.sent,l.next=59,r.a.awrap(this.initOpenWebApp("mail",e));case 59:l.t6=l.sent,c={profile:l.t4,graph:l.t5,mail:l.t6},window.apps=c,this.apps=c,this.setState({apps:c}),console.log(c);case 65:case"end":return l.stop()}}),null,this)}},{key:"initOpenWebApp",value:function(e,t){var n,a,s;return r.a.async((function(o){for(;;)switch(o.prev=o.next){case 0:return console.log("Initializing app: "+e+" ..."),o.next=3,r.a.awrap(new y(e,t,window.nearConfig));case 3:return n=o.sent,o.next=6,r.a.awrap(n.init());case 6:return o.next=8,r.a.awrap(n.ready());case 8:if(o.sent){o.next=18;break}return o.next=11,r.a.awrap(n.getPublicKey());case 11:return a=o.sent,console.log("Authorizing app for key "+a.toString()+" ..."),s={public_key:Object(l.a)(v.utils.serialize.serialize(v.transactions.SCHEMA,a)),app_id:e},o.next=16,r.a.awrap(this.masterContract.add_app_key(s,2e15));case 16:return o.next=18,r.a.awrap(n.onKeyAdded());case 18:return console.log("Done"),o.abrupt("return",n);case 20:case"end":return o.stop()}}),null,this)}},{key:"requestSignIn",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return"Open Web Home",e.next=3,r.a.awrap(this.props.wallet.requestSignIn("","Open Web Home"));case 3:case"end":return e.stop()}}),null,this)}},{key:"render",value:function(){var e=this;return document.title=(this.state.unread?"(".concat(this.state.unread,") "):"")+"Open Web Home - NEAR",o.a.createElement("div",{className:"App-header"},o.a.createElement("div",{className:"image-wrapper"},o.a.createElement("img",{className:"logo",src:w.a,alt:"NEAR logo"})),o.a.createElement("h1",null,"Hello",this.state.login?", "+this.state.accountId:"?"),o.a.createElement("div",null,this.state.login?o.a.createElement("button",{onClick:this.requestSignOut},"Log out"):o.a.createElement("button",{onClick:this.requestSignIn},"Log in with NEAR")),o.a.createElement("br",null),this.state.login&&o.a.createElement("div",{className:"apps"},o.a.createElement(S.d,{forceRenderTabPanel:!0},o.a.createElement(S.b,null,o.a.createElement(S.a,null,"Profile"),o.a.createElement(S.a,null,"Mail ",this.state.unread?"(".concat(this.state.unread,")"):"")),o.a.createElement(S.c,null,o.a.createElement(k,{app:this.state.apps.profile})),o.a.createElement(S.c,null,o.a.createElement(N,{app:this.state.apps.mail,onNewMail:function(t){return e.setState({unread:t})}})))))}}]),t}(s.Component)),_=n(70),O=n.n(_);window.nearInitPromise=r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return window.nearConfig=O()("development"),console.log("nearConfig",window.nearConfig),e.next=4,r.a.awrap(v.connect(Object.assign({deps:{keyStore:new v.keyStores.BrowserLocalStorageKeyStore}},window.nearConfig)));case 4:window.near=e.sent,window.walletAccount=new v.WalletAccount(window.near),window.accountId=window.walletAccount.getAccountId();case 7:case"end":return e.stop()}})).then((function(){c.a.render(o.a.createElement(C,{contract:window.contract,wallet:window.walletAccount}),document.getElementById("root"))})).catch(console.error)},37:function(e,t,n){e.exports=n.p+"static/media/anon.5cbbd243.png"},69:function(e,t,n){e.exports=n.p+"static/media/gray_near_logo.55517b93.svg"},70:function(e,t,n){!function(){function t(e){switch(e){case"production":case"development":return{networkId:"default",nodeUrl:"https://rpc.nearprotocol.com",contractName:"react-template",walletUrl:"https://wallet.nearprotocol.com"};case"staging":return{networkId:"staging",nodeUrl:"https://staging-rpc.nearprotocol.com/",contractName:"react-template",walletUrl:"https://near-wallet-staging.onrender.com"};case"local":return{networkId:"local",nodeUrl:"http://localhost:3030",keyPath:"".concat(Object({NODE_ENV:"production",PUBLIC_URL:""}).HOME,"/.near/validator_key.json"),walletUrl:"http://localhost:4000/wallet",contractName:"react-template"};case"test":return{networkId:"local",nodeUrl:"http://localhost:3030",contractName:"react-template",masterAccount:"test.near"};case"test-remote":case"ci":return{networkId:"shared-test",nodeUrl:"http://shared-test.nearprotocol.com:3030",contractName:"react-template",masterAccount:"test.near"};case"ci-staging":return{networkId:"shared-test-staging",nodeUrl:"http://staging-shared-test.nearprotocol.com:3030",contractName:"react-template",masterAccount:"test.near"};default:throw Error("Unconfigured environment '".concat(e,"'. Can be configured in src/config.js."))}}var a=n(140),r="undefined"!=typeof a&&a.getJSON("fiddleConfig");e.exports?(console.log("module works"),e.exports=t):(console.log("Cookie works"),window.nearConfig=r&&r.nearPages?r:t("development"))}()},71:function(e,t,n){e.exports=n(141)},77:function(e,t,n){},91:function(e,t){},93:function(e,t){}},[[71,1,2]]]);
//# sourceMappingURL=main.d148d7de.chunk.js.map