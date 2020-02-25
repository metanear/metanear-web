(this["webpackJsonpnear-open-web-frontend"]=this["webpackJsonpnear-open-web-frontend"]||[]).push([[0],{101:function(e,t,n){},115:function(e,t){},117:function(e,t){},138:function(e,t){},143:function(e,t){},168:function(e,t,n){"use strict";n.r(t);var a=n(1),r=n.n(a),s=n(0),i=n.n(s),c=n(15),o=n.n(c),l=n(10),p=n(11),u=n(17),h=n(16),d=n(18),f=n(90),m=n(28),g=n(43),y=n(25),b=n(84),w=n.n(b),v=(n(101),n(7)),k=n(31),x=n(40),E=n(41),I=n.n(E),N=n(85),S=n.n(N),_=n(44),O=n(94),C=function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(u.a)(this,Object(h.a)(t).call(this,e))).state={displayName:"",profileUrl:null,bio:"",loading:!1,found:!1},window.profileComponentCache||(window.profileComponentCache={profileCache:{},app:new k.a("profile",null,window.nearConfig)},window.profileComponentCache.app.init()),n.profileCache=window.profileComponentCache.profileCache,n.app=window.profileComponentCache.app,n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"componentDidMount",value:function(){var e=this;this.props.accountId&&this.app.ready().then((function(){return e.updateProfile(e.props.accountId)}))}},{key:"fetchProfile",value:function(e){return r.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(e in this.profileCache)){t.next=6;break}return t.next=3,r.a.awrap(this.profileCache[e]);case 3:return t.abrupt("return",t.sent);case 6:return console.log("Fetching profile for "+e),this.profileCache[e]=Promise.all([this.app.getFrom(e,"displayName"),this.app.getFrom(e,"profileUrl"),this.app.getFrom(e,"bio")]).then((function(t){return{accountId:e,displayName:t[0]||"",profileUrl:t[1],bio:t[2]||""}})).catch((function(e){return!1})),t.next=10,r.a.awrap(this.profileCache[e]);case 10:return t.abrupt("return",t.sent);case 11:case"end":return t.stop()}}),null,this)}},{key:"updateProfile",value:function(e){var t=this;this.setState({displayName:"",profileUrl:null,bio:"",loading:!0,found:!1}),this.fetchProfile(this.props.accountId).then((function(e){e?t.setState({displayName:e.displayName,profileUrl:e.profileUrl,bio:e.bio,loading:!1,found:!0}):t.setState({loading:!1,found:!1}),t.props.onFetch&&t.props.onFetch(e)}))}},{key:"componentDidUpdate",value:function(e){this.props.accountId!==e.accountId&&this.updateProfile(this.props.accountId)}},{key:"render",value:function(){var e=this.props.displayName||this.state.displayName,t=this.props.profileUrl||this.state.profileUrl||I.a,n=this.props.bio||this.state.bio,a=i.a.createElement(_.a,{className:"profile-popover",id:"profile-popover-"+this.props.accountId},i.a.createElement(_.a.Title,{as:"h3"},e),i.a.createElement(_.a.Content,null,i.a.createElement("div",null,i.a.createElement("img",{className:"profile-image",src:t,alt:"Profile @".concat(this.props.accountId)}),i.a.createElement("span",{className:"profile-account-id"},"@"+this.props.accountId)),i.a.createElement("div",null,n)));return this.state.loading?i.a.createElement("div",{className:"profile"},i.a.createElement("div",{className:"spinner-grow",role:"status"},i.a.createElement("span",{className:"sr-only"},"Loading..."))):this.state.found?i.a.createElement(O.a,{placement:"auto",delay:{show:250,hide:100},overlay:a},i.a.createElement("div",{className:"profile"},i.a.createElement("img",{className:"profile-image",src:t,alt:"Profile @".concat(this.props.accountId)}),i.a.createElement("span",{className:"profile-name"},i.a.createElement("span",{className:"profile-display-name"},e),i.a.createElement("span",{className:"profile-account-id"},"(@"+this.props.accountId+")")))):null}}]),t}(i.a.Component),j=function(e){function t(e){var n;Object(l.a)(this,t);var a=["displayName","profileUrl","bio"];return(n=Object(u.a)(this,Object(h.a)(t).call(this,e))).state=a.reduce((function(e,t){return e[t]="",e.chainValues[t]=null,e}),{keys:a,chainValues:{},initialized:!1}),n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"init",value:function(){var e,t,n=this;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return this.setState({initialized:!0}),a.next=3,r.a.awrap(Promise.all(this.state.keys.map((function(e){return n.props.app.get(e)}))));case 3:e=a.sent,t=this.state.keys.reduce((function(t,n,a){return t[n]=e[a]||"",t}),{}),this.setState(Object.assign({chainValues:t},t));case 6:case"end":return a.stop()}}),null,this)}},{key:"componentDidUpdate",value:function(e){this.props.app&&!this.state.initialized&&this.init()}},{key:"handleChange",value:function(e,t){console.log(t.length),this.setState(Object(x.a)({},e,t))}},{key:"save",value:function(){var e,t=this;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:console.log("Saving"),e=Object.assign({},this.state.chainValues),this.state.keys.forEach((function(n){t.state.chainValues[n]!==t.state[n]&&(e[n]=t.state[n],t.props.app.set(n,t.state[n]).then((function(){console.log("Updated key `"+n+"` to value `"+t.state[n]+"`")})))})),this.setState({chainValues:e});case 4:case"end":return n.stop()}}),null,this)}},{key:"onFilesChange",value:function(e){var t,n,a=this;return r.a.async((function(r){for(;;)switch(r.prev=r.next){case 0:t=new Image,(n=new FileReader).readAsDataURL(e[0]),t.onload=function(){var e=document.createElement("canvas"),n=t.naturalWidth/t.naturalHeight,r=Math.round(96*Math.max(1,n)),s=Math.round(96*Math.max(1,1/n));e.width=96,e.height=96;var i=e.getContext("2d");i.imageSmoothingQuality="high",i.fillStyle="#fff",i.fillRect(0,0,96,96),i.drawImage(t,(96-r)/2,(96-s)/2,r,s);var c=[e.toDataURL("image/jpeg",.92),e.toDataURL("image/webp",.92),e.toDataURL("image/png")];c.sort((function(e,t){return e.length-t.length})),a.handleChange("profileUrl",c[0])},n.onload=function(e){t.src=e.target.result};case 5:case"end":return r.stop()}}))}},{key:"onFilesError",value:function(e,t){return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:console.log(e,t);case 1:case"end":return n.stop()}}))}},{key:"render",value:function(){var e=this;return i.a.createElement("div",null,i.a.createElement("div",null,i.a.createElement("button",{className:"float-right",onClick:this.props.logOut},"Log out"),i.a.createElement(C,{accountId:this.props.app&&this.props.app.accountId,profileUrl:this.state.profileUrl,displayName:this.state.displayName,bio:this.state.bio})),i.a.createElement("hr",null),i.a.createElement("div",null,i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"displayName"},"Display Name"),i.a.createElement("input",{placeholder:"The REAL Satoshi",id:"displayName",className:"form-control",disabled:!this.props.app,value:this.state.displayName,onChange:function(t){return e.handleChange("displayName",t.target.value)}})),i.a.createElement("label",{htmlFor:"profileUrl"},"Profile URL"),i.a.createElement("div",{className:"input-group"},i.a.createElement("input",{placeholder:"https://metanear.com"+I.a,id:"profileUrl",className:"form-control",disabled:!this.props.app,value:this.state.profileUrl,onChange:function(t){return e.handleChange("profileUrl",t.target.value)}}),i.a.createElement("div",{className:"input-group-append"},i.a.createElement(S.a,{type:"button",className:"btn btn-outline-primary",onChange:function(t){return e.onFilesChange(t)},onError:function(t,n){return e.onFilesError(t,n)},multiple:!1,accepts:["image/*"],minFileSize:1,clickable:!0},"Click to upload"))),i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{htmlFor:"bio"},"Bio"),i.a.createElement("textarea",{placeholder:"I'm working on Bitcoin, so bankers can go home.",id:"bio",className:"form-control",disabled:!this.props.app,value:this.state.bio,onChange:function(t){return e.handleChange("bio",t.target.value)}})),i.a.createElement("div",{className:"form-group"},i.a.createElement("button",{onClick:function(){return e.save()}},"Save changes"))))}}]),t}(i.a.Component),L=n(87),K=n.n(L),P=n(88),A=n.n(P),U=function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(u.a)(this,Object(h.a)(t).call(this,e))).state={initialized:!1,receiverId:"",subject:"",content:"",sending:!1,numLetters:0,unread:0,expandedId:-1,profileFound:!1,profileLoading:!1,keyLoading:!1,theirPublicKey64:null,inbox:[]},n.textarea=i.a.createRef(),n.keyCache={},n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"modifyLetter",value:function(e,t){if(void 0===t){if(!e)return;t=e.messageId}var n=this.state.inbox.filter((function(e){return e.messageId!==t}));e&&n.push(e),n.sort((function(e,t){return t.time-e.time}));var a=n.reduce((function(e,t){return e+(t.read?0:1)}),0);this.setState({inbox:n,unread:a}),this.props.onNewMail(a)}},{key:"migrateFrom",value:function(e){var t,n,a,s,i=this;return r.a.async((function(c){for(;;)switch(c.prev=c.next){case 0:if(0!==e){c.next=19;break}return console.log("Migrating from version #0"),t=0,c.prev=3,c.next=6,r.a.awrap(this.props.app.get("numLetters"));case 6:t=c.sent,c.next=11;break;case 9:c.prev=9,c.t0=c.catch(3);case 11:for(n=[],a=function(e){n.push(i.props.app.get("letter_"+e).then((function(t){return t?i.props.app.set("letter_"+e,t,{encrypted:!0}).then((function(){console.log("Migrated letter #"+e)})):Promise.resolve()})).catch((function(t){return console.log("Can't migrate letter #",e,t)})))},s=0;s<t;++s)a(s);return c.next=16,r.a.awrap(Promise.all(n));case 16:return c.next=18,r.a.awrap(this.props.app.set("numLetters",t,{encrypted:!0}));case 18:e++;case 19:if(1!==e){c.next=24;break}return console.log("Migrating from version #1"),c.next=23,r.a.awrap(this.props.app.storeEncryptionPublicKey());case 23:e++;case 24:return c.next=26,r.a.awrap(this.props.app.set("version",e,{encrypted:!0}));case 26:case"end":return c.stop()}}),null,this,[[3,9]])}},{key:"init",value:function(){var e,t,n,a=this;return r.a.async((function(s){for(;;)switch(s.prev=s.next){case 0:return this.setState({initialized:!0}),s.next=3,r.a.awrap(this.props.app.get("version",{encrypted:!0}));case 3:if(s.t0=s.sent,s.t0){s.next=6;break}s.t0=0;case 6:if(!((e=s.t0)<2)){s.next=10;break}return s.next=10,r.a.awrap(this.migrateFrom(e));case 10:return s.next=12,r.a.awrap(this.props.app.get("numLetters",{encrypted:!0}));case 12:if(s.t1=s.sent,s.t1){s.next=15;break}s.t1=0;case 15:for(t=s.t1,this.setState({numLetters:t}),n=Math.max(0,t-10);n<t;++n)this.props.app.get("letter_"+n,{encrypted:!0}).then((function(e){return a.modifyLetter(e)}));this.fetchMessages();case 19:case"end":return s.stop()}}),null,this)}},{key:"componentDidUpdate",value:function(e){this.props.app&&!this.state.initialized&&this.init()}},{key:"fetchKey",value:function(e){return r.a.async((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(e in this.keyCache)){t.next=6;break}return t.next=3,r.a.awrap(this.keyCache[e]);case 3:return t.abrupt("return",t.sent);case 6:return console.log("Fetching key for "+e),this.keyCache[e]=this.props.app.getFrom(e,k.b).catch((function(e){return!1})),t.next=10,r.a.awrap(this.keyCache[e]);case 10:return t.abrupt("return",t.sent);case 11:case"end":return t.stop()}}),null,this)}},{key:"updateKey",value:function(e){var t=this;this.props.app&&(this.setState({profileLoading:!1,profileFound:!!e}),e&&(this.setState({keyLoading:!0}),this.fetchKey(e.accountId).then((function(e){t.setState({keyLoading:!1,theirPublicKey64:e})}))))}},{key:"handleChange",value:function(e,t){var n=Object(x.a)({},e,t);"receiverId"===e&&(t=t.toLowerCase().replace(/[^a-z0-9\-_.]/,""),n[e]=t,n.profileLoading=!0,n.theirPublicKey64=!1),this.setState(n)}},{key:"fetchMessages",value:function(){var e,t,n,a,s,i,c,o=this;return r.a.async((function(l){for(;;)switch(l.prev=l.next){case 0:if(this.props.app){l.next=2;break}return l.abrupt("return");case 2:return this.fetchTimeoutId&&(clearTimeout(this.fetchTimeoutId),this.fetchTimeoutId=null),console.log("Fetching messages"),l.next=6,r.a.awrap(this.props.app.pullMessage());case 6:if(e=l.sent){l.next=10;break}return this.fetchTimeoutId=setTimeout((function(){o.fetchMessages()}),6e4),l.abrupt("return");case 10:if(l.prev=10,console.log(e),t=JSON.parse(e.message),n="encrypted"===t.type,a=t.fromAppId||this.props.app.appId,!n){l.next=20;break}return l.next=18,r.a.awrap(this.props.app.decryptMessage(t.content,{accountId:e.sender,appId:t.fromAppId}));case 18:s=l.sent,t=JSON.parse(s);case 20:"mail"===t.type?(i={messageId:this.state.numLetters,isEncrypted:n,fromAppId:a,sender:e.sender,subject:t.subject,content:t.content,time:Math.trunc(e.time/1e6)},c=this.state.numLetters+1,this.setState({numLetters:c}),this.props.app.set("letter_"+i.messageId,i,{encrypted:!0}).then((function(){console.log("Saved the letter: ",i)})),this.props.app.set("numLetters",c,{encrypted:!0}).then((function(){console.log("Saved the new number of letters: ",c)})),this.modifyLetter(i)):console.warn("Unknown message",e),l.next=26;break;case 23:l.prev=23,l.t0=l.catch(10),console.error(l.t0);case 26:return l.prev=26,this.fetchMessages(),l.finish(26);case 29:case"end":return l.stop()}}),null,this,[[10,23,26,29]])}},{key:"sendMail",value:function(){var e,t;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:if(this.state.profileFound){n.next=2;break}return n.abrupt("return");case 2:if(console.log("Sending mail"),this.setState({sending:!0}),n.prev=4,e=JSON.stringify({type:"mail",subject:this.state.subject,content:this.state.content}),!this.state.theirPublicKey64){n.next=11;break}return n.next=9,r.a.awrap(this.props.app.encryptMessage(e,{theirPublicKey64:this.state.theirPublicKey64}));case 9:t=n.sent,e=JSON.stringify({type:"encrypted",fromAppId:this.props.app.appId,content:t});case 11:return n.next=13,r.a.awrap(this.props.app.sendMessage(this.state.receiverId,e));case 13:this.setState({subject:"",content:""}),n.next=19;break;case 16:n.prev=16,n.t0=n.catch(4),console.log("Failed to send the message",n.t0);case 19:return n.prev=19,this.setState({sending:!1}),this.fetchMessages(),n.finish(19);case 23:case 24:case"end":return n.stop()}}),null,this,[[4,16,19,23]])}},{key:"receiverClass",value:function(){return!this.state.receiverId||this.state.profileLoading?"form-control":this.state.profileFound?"form-control is-valid":"form-control is-invalid"}},{key:"replyTo",value:function(e,t){var n=this;this.handleChange("receiverId",e.sender),this.setState({subject:(e.subject.startsWith("Re: ")?"":"Re: ")+e.subject,content:["","",["On",new Date(e.time).toLocaleDateString(),t,"@"+e.sender,"wrote:"].join(" ")].concat(Object(g.a)(e.content.split(/\r?\n/).map((function(e){return"| "+e})))).join("\n")},(function(){n.textarea.current.focus(),n.textarea.current.setSelectionRange(0,0),n.textarea.current.scrollLeft=0,n.textarea.current.scrollTop=0}))}},{key:"selectLetter",value:function(e){this.setState({expandedId:this.state.expandedId===e.messageId?-1:e.messageId}),e.read||((e=JSON.parse(JSON.stringify(e))).read=!0,this.props.app.set("letter_"+e.messageId,e,{encrypted:!0}).then((function(){console.log("Saved the letter: ",e)})),this.modifyLetter(e))}},{key:"deleteLetter",value:function(e){this.props.app.remove("letter_"+e.messageId).then((function(){console.log("Deleted the letter: ",e)})),this.modifyLetter(null,e.messageId)}},{key:"render",value:function(){var e=this,t=this.state.theirPublicKey64,n=this.state.profileFound&&!this.state.keyLoading,a=t?"Encryption is ON":"Not secure! Encryption is OFF",r=n&&i.a.createElement("img",{className:"encryption-icon",src:t?K.a:A.a,title:a,alt:a}),s=i.a.createElement(C,{accountId:this.state.receiverId,onFetch:function(t){return e.updateKey(t)}}),c=this.state.inbox.map((function(t,n){return i.a.createElement(F,{key:t.messageId,letter:t,expanded:t.messageId===e.state.expandedId,deleteLetter:function(t){return e.deleteLetter(t)},replyTo:function(t,n){return e.replyTo(t,n)},selectLetter:function(t){return e.selectLetter(t)}})}));return i.a.createElement("div",null,"Inbox ",i.a.createElement("button",{className:"btn btn-sm",onClick:function(){return e.fetchMessages()}},i.a.createElement("span",{role:"img","aria-label":"Refresh"},"\ud83d\udd04")),i.a.createElement("div",null,c),i.a.createElement("h3",null,"Send"),i.a.createElement("div",{className:"form-row"},i.a.createElement("div",{className:"col"},i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{className:"sr-only",htmlFor:"toAccountId"},"To Account ID"),i.a.createElement("div",{className:"input-group"},i.a.createElement("div",{className:"input-group-prepend"},i.a.createElement("div",{className:"input-group-text"},"@")),i.a.createElement("input",{type:"text",className:this.receiverClass(),id:"toAccountId",placeholder:"To Account ID",value:this.state.receiverId,disabled:!this.props.app,onChange:function(t){return e.handleChange("receiverId",t.target.value)}})))),s),i.a.createElement("div",{className:"form-group"},i.a.createElement("label",{className:"sr-only",htmlFor:"subject"},"Subject"),i.a.createElement("input",{type:"text",className:"form-control",id:"subject",placeholder:"Subject",disabled:!this.props.app,value:this.state.subject,onChange:function(t){return e.handleChange("subject",t.target.value)}})),i.a.createElement("div",{className:"form-group"},i.a.createElement("textarea",{ref:this.textarea,id:"content",className:"form-control",rows:"7",disabled:!this.props.app,value:this.state.content,onChange:function(t){return e.handleChange("content",t.target.value)}})),i.a.createElement("div",{className:"form-group"},i.a.createElement("button",{className:"form-control form-control-lg btn "+(n&&!t?"btn-danger":"btn-primary"),disabled:!this.state.profileFound||this.state.sending,onClick:function(){return e.sendMail()}},"Send ",r)))}}]),t}(i.a.Component),F=function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(u.a)(this,Object(h.a)(t).call(this,e))).state={profile:{profileUrl:null,displayName:"@"+e.letter.sender}},n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"onClick",value:function(){this.props.selectLetter(this.props.letter)}},{key:"render",value:function(){var e,t=this,n=i.a.createElement("div",{className:"col-sm-6 col-md-4 col-lg-4 letter-profile"},i.a.createElement(C,{accountId:this.props.letter.sender,onFetch:function(e){return e&&t.setState({displayName:e.displayName})}})),a=i.a.createElement("div",{className:"col-sm-4 col-md"},i.a.createElement("div",{className:"letter-subject"},this.props.letter.subject)),r=this.props.expanded?i.a.createElement("div",{className:"col-sm-2 col-lg-2"},i.a.createElement("div",{className:"letter-time"},(e=this.props.letter.time,new Date(e).toLocaleString()))):i.a.createElement("div",{className:"col-sm-2 col-lg-1 d-none d-md-block"},i.a.createElement("div",{className:"letter-time"},function(e){var t=new Date(e);if((new Date).getDate()===t.getDate()){var n=t.getHours()%12,a=t.getMinutes().toString().padStart(2,"0"),r=t.getHours()>=12?"PM":"AM";return"".concat(n,":").concat(a," ").concat(r)}return t.toLocaleDateString()}(this.props.letter.time)));return this.props.expanded?i.a.createElement("div",{className:"letter letter-expanded"},i.a.createElement("div",{className:"row letter-expanded-header",onClick:function(){return t.onClick()}},n,a,r),i.a.createElement("div",{className:"letter-content-expanded"},i.a.createElement("pre",null,this.props.letter.content),i.a.createElement("div",{className:"row"},i.a.createElement("div",{className:"col-sm"},i.a.createElement("button",{className:"btn btn-primary",onClick:function(){return t.props.replyTo(t.props.letter,t.state.displayName)}},"Reply")),i.a.createElement("div",{className:"col-sm"},i.a.createElement("button",{className:"btn btn-danger float-right",onClick:function(){return t.props.deleteLetter(t.props.letter)}},"DELETE THIS!"))))):i.a.createElement("div",{className:"row letter letter-small"+(this.props.letter.read?" letter-read":" letter-unread"),onClick:function(){return t.onClick()}},n,a,i.a.createElement("div",{className:"col-sm d-none d-lg-block"},i.a.createElement("div",{className:"letter-content"},this.props.letter.content)),r)}}]),t}(i.a.Component);var M=n(29),D=(n(163),function(e){function t(e){var n;return Object(l.a)(this,t),(n=Object(u.a)(this,Object(h.a)(t).call(this,e))).requestSignOut=function(){n.props.wallet.signOut(),setTimeout(n.signedOutFlow,500),console.log("after sign out",n.props.wallet.isSignedIn())},n.signedOutFlow=function(){window.location.search.includes("account_id")&&window.location.replace(window.location.origin+window.location.pathname),n.setState({login:!1})},n.state={login:!1,apps:{},logs:[],unread:0,loading:!1},n.signedInFlow=n.signedInFlow.bind(Object(y.a)(n)),n.requestSignIn=n.requestSignIn.bind(Object(y.a)(n)),n.requestSignOut=n.requestSignOut.bind(Object(y.a)(n)),n.signedOutFlow=n.signedOutFlow.bind(Object(y.a)(n)),n.checkSignIn=n.checkSignIn.bind(Object(y.a)(n)),n.initOpenWebApp=n.initOpenWebApp.bind(Object(y.a)(n)),window.nearlib=v,n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"componentDidMount",value:function(){this.checkSignIn()}},{key:"checkSignIn",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:if(!window.walletAccount.isSignedIn()){e.next=6;break}return e.next=4,r.a.awrap(this.signedInFlow());case 4:e.next=7;break;case 6:this.signedOutFlow();case 7:case"end":return e.stop()}}),null,this)}},{key:"log",value:function(e){console.log(e),this.setState({logs:this.state.logs.concat([e])})}},{key:"signedInFlow",value:function(){var e,t,n,a,s,i,c,o;return r.a.async((function(l){for(;;)switch(l.prev=l.next){case 0:return l.next=2,r.a.awrap(this.props.wallet.getAccountId());case 2:return e=l.sent,this.setState({login:!0,loading:!0,accountId:e}),window.location.search.includes("account_id")&&window.location.replace(window.location.origin+window.location.pathname),window.location.search.includes("all_keys")&&window.location.replace(window.location.origin+window.location.pathname),this.log("Connecting to account..."),l.next=9,r.a.awrap(new v.Account(window.near.connection,e));case 9:return t=l.sent,this.log("Querying state..."),l.next=13,r.a.awrap(t.state());case 13:if(n=l.sent,console.log(n),"C8UmYSqATkuyhheJ7i7ryxPjfZL4nV8PfkovdMKitsmJ"===n.code_hash){l.next=38;break}return this.log("Going to deploy the code"),this.log("Downloading started..."),l.next=20,r.a.awrap(fetch("/open_web.wasm"));case 20:return a=l.sent,l.next=23,r.a.awrap(a.arrayBuffer());case 23:return s=l.sent,this.log("Downloading done. Deploying contract..."),l.next=27,r.a.awrap(t.deployContract(new Uint8Array(s)));case 27:if("11111111111111111111111111111111"!==n.code_hash){l.next=37;break}return this.log("Deploying done. Initializing contract..."),l.next=31,r.a.awrap(new v.Contract(t,e,{viewMethods:[],changeMethods:["new"],sender:e}));case 31:return i=l.sent,l.t0=console,l.next=35,r.a.awrap(i.new());case 35:l.t1=l.sent,l.t0.log.call(l.t0,l.t1);case 37:this.log("The contract is deployed");case 38:return l.next=40,r.a.awrap(new v.Contract(t,e,{viewMethods:["apps"],changeMethods:["add_app_key","remove_app_key"],sender:e}));case 40:return c=l.sent,this.masterContract=c,window.masterContract=c,this.log("Fetching authorized apps..."),l.t2=console,l.next=47,r.a.awrap(c.apps());case 47:return l.t3=l.sent,l.t2.log.call(l.t2,"Apps:",l.t3),this.log("Initializing local apps..."),l.next=52,r.a.awrap(this.initOpenWebApp("profile",e));case 52:return l.t4=l.sent,l.next=55,r.a.awrap(this.initOpenWebApp("graph",e));case 55:return l.t5=l.sent,l.next=58,r.a.awrap(this.initOpenWebApp("mail",e));case 58:l.t6=l.sent,o={profile:l.t4,graph:l.t5,mail:l.t6},window.apps=o,this.apps=o,this.setState({apps:o,loading:!1});case 63:case"end":return l.stop()}}),null,this)}},{key:"initOpenWebApp",value:function(e,t){var n,a,s;return r.a.async((function(i){for(;;)switch(i.prev=i.next){case 0:return this.log("Initializing app: "+e+" ..."),n=new k.a(e,t,window.nearConfig),i.next=4,r.a.awrap(n.init());case 4:return i.next=6,r.a.awrap(n.ready());case 6:if(i.sent){i.next=16;break}return i.next=9,r.a.awrap(n.getAccessPublicKey());case 9:return a=i.sent,this.log("Authorizing app for key "+a.toString()+" ..."),s={public_key:Object(g.a)(v.utils.serialize.serialize(v.transactions.SCHEMA,a)),app_id:e},i.next=14,r.a.awrap(this.masterContract.add_app_key(s,2e15));case 14:return i.next=16,r.a.awrap(n.onKeyAdded());case 16:return i.abrupt("return",n);case 17:case"end":return i.stop()}}),null,this)}},{key:"requestSignIn",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return"Open Web Home",e.next=3,r.a.awrap(this.props.wallet.requestSignIn("","Open Web Home"));case 3:case"end":return e.stop()}}),null,this)}},{key:"render",value:function(){var e=this;return document.title=(this.state.unread?"(".concat(this.state.unread,") "):"")+"Open Web Home - NEAR",this.state.login?i.a.createElement("div",null,this.state.loading&&i.a.createElement("div",{className:"loading-div"},i.a.createElement("div",{className:"spinner-grow loading-spinner",role:"status"},i.a.createElement("span",{className:"sr-only"},"Loading...")),i.a.createElement("pre",{className:"text-left"},this.state.logs.join("\n"))),i.a.createElement("div",{className:"apps"+(this.state.loading?" d-none":"")},i.a.createElement(M.d,{forceRenderTabPanel:!0},i.a.createElement(M.b,null,i.a.createElement(M.a,null,"Profile"),i.a.createElement(M.a,null,"Mail ",this.state.unread?"(".concat(this.state.unread,")"):"")),i.a.createElement(M.c,null,i.a.createElement(j,{app:this.state.apps.profile,logOut:this.requestSignOut})),i.a.createElement(M.c,null,i.a.createElement(U,{app:this.state.apps.mail,onNewMail:function(t){return e.setState({unread:t})}}))))):i.a.createElement("div",{className:"App-header"},i.a.createElement("div",null,i.a.createElement("div",{className:"image-wrapper"},i.a.createElement("img",{className:"logo",src:w.a,alt:"NEAR logo"})),i.a.createElement("h1",null,"Hello ?"),i.a.createElement("div",null,i.a.createElement("button",{onClick:this.requestSignIn},"Log in with NEAR"))))}}]),t}(s.Component)),T=n(89),R=n.n(T),z=function(e){function t(e){var n;Object(l.a)(this,t),n=Object(u.a)(this,Object(h.a)(t).call(this,e));var a=R.a.parse(n.props.location.search),r=a.app_id,s=a.pub_key;return n.state=r&&s?{authorized:!1,new_app_id:r,new_pub_key:s}:{authorized:!1,new_app_id:"",new_pub_key:""},n}return Object(d.a)(t,e),Object(p.a)(t,[{key:"componentDidMount",value:function(){var e=this;!this.props.loading&&this.state.new_app_id&&this.state.new_pub_key&&this.props.initOpenWebApp(this.state.new_app_id,this.state.new_pub_key).then((function(t){e.setState({authorized:!0})}))}},{key:"componentDidUpdate",value:function(e){this.props.app&&this.state.initialized}},{key:"render",value:function(){return i.a.createElement("div",null,this.state.authorized?i.a.createElement("div",null,i.a.createElement("p",null,"App ",i.a.createElement("strong",null,this.state.new_app_id)," was added"),i.a.createElement("p",null," Using the public key: ",this.state.new_pub_key," ")):"You need pass a key in order to add an app")}}]),t}(i.a.Component),B=function(e){function t(){return Object(l.a)(this,t),Object(u.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(p.a)(t,[{key:"render",value:function(){var e=this;return i.a.createElement(f.a,{basename:"",hashType:"noslash"},i.a.createElement(m.c,null,i.a.createElement(m.a,{exact:!0,path:"/",component:function(){return i.a.createElement(D,e.props)}}),i.a.createElement(m.a,{path:"/auth",component:function(){return i.a.createElement(z,e.props)}})))}}]),t}(s.Component),J=n(93),W=n.n(J);window.nearInitPromise=r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return window.nearConfig=W()("development"),e.next=3,r.a.awrap(v.connect(Object.assign({deps:{keyStore:new v.keyStores.BrowserLocalStorageKeyStore}},window.nearConfig)));case 3:window.near=e.sent,window.walletAccount=new v.WalletAccount(window.near),window.accountId=window.walletAccount.getAccountId();case 6:case"end":return e.stop()}})).then((function(){o.a.render(i.a.createElement(B,{contract:window.contract,wallet:window.walletAccount}),document.getElementById("root"))})).catch(console.error)},31:function(e,t,n){"use strict";(function(e){n.d(t,"b",(function(){return l})),n.d(t,"a",(function(){return p}));var a=n(1),r=n.n(a),s=n(10),i=n(11),c=n(7),o=n(4),l="encryptionKey",p=function(){function t(n,a,r){Object(s.a)(this,t),this.appId=n,this.accountId=a,this._config=r,this.blocking=Promise.resolve(),this.parseEncryptionKey(),window.nacl=o,window.Buffer=e}return Object(i.a)(t,[{key:"parseEncryptionKey",value:function(){var t="enc_key:"+this.accountId+":"+this.appId+":",n=localStorage.getItem(t);n?n=o.box.keyPair.fromSecretKey(e.from(n,"base64")):(n=new o.box.keyPair,localStorage.setItem(t,e.from(n.secretKey).toString("base64"))),this._key=n}},{key:"_innerInit",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return this._keyStore=new c.keyStores.BrowserLocalStorageKeyStore(localStorage,"app:"+this.appId),e.next=3,r.a.awrap(c.connect(Object.assign({deps:{keyStore:this._keyStore}},this._config)));case 3:return this._near=e.sent,this._account=new c.Account(this._near.connection,this.accountId),this._contract=new c.Contract(this._account,this.accountId,{viewMethods:["get","apps","num_messages"],changeMethods:["set","remove","pull_message","send_message"],sender:this.accountId}),this._networkId=this._config.networkId,e.abrupt("return",!0);case 8:case"end":return e.stop()}}),null,this)}},{key:"init",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this._ready||(this._ready=this._innerInit()));case 1:case"end":return e.stop()}}),null,this)}},{key:"ready",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.init());case 1:case"end":return e.stop()}}),null,this)}},{key:"getAccessPublicKey",value:function(){var e,t;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,r.a.awrap(this._keyStore.getKey(this._networkId,this.accountId));case 2:if(!(e=n.sent)){n.next=5;break}return n.abrupt("return",e.getPublicKey());case 5:if(!this._tmpKey){n.next=7;break}return n.abrupt("return",this._tmpKey.getPublicKey());case 7:return t=c.KeyPair.fromRandom("ed25519"),this._tmpKey=t,n.abrupt("return",t.getPublicKey());case 10:case"end":return n.stop()}}),null,this)}},{key:"getEncryptionPublicKey",value:function(){return e.from(this._key.publicKey).toString("base64")}},{key:"storeEncryptionPublicKey",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",this.set(l,this.getEncryptionPublicKey()));case 1:case"end":return e.stop()}}),null,this)}},{key:"onKeyAdded",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:if(this._tmpKey){e.next=2;break}throw new Error("The key is not initialized yet");case 2:return e.next=4,r.a.awrap(this._keyStore.setKey(this._networkId,this.accountId,this._tmpKey));case 4:this._tmpKey=null;case 5:case"end":return e.stop()}}),null,this)}},{key:"forceReady",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.a.awrap(this.ready());case 2:if(e.sent){e.next=4;break}throw new Error("Not ready yet");case 4:case"end":return e.stop()}}),null,this)}},{key:"wrappedCall",value:function(e){return this.blocking=this.blocking.then((function(){return e()})).catch((function(){return e()})),this.blocking}},{key:"decryptSecretBox",value:function(t){var n=e.from(t,"base64"),a=new Uint8Array(o.secretbox.nonceLength);n.copy(a,0,0,a.length);var r=new Uint8Array(n.length-o.secretbox.nonceLength);n.copy(r,0,a.length);var s=o.secretbox.open(r,a,this._key.secretKey);return e.from(s).toString()}},{key:"encryptSecretBox",value:function(t){var n=e.from(t),a=o.randomBytes(o.secretbox.nonceLength),r=o.secretbox(n,a,this._key.secretKey),s=new Uint8Array(r.length+o.secretbox.nonceLength);return s.set(a),s.set(r,o.secretbox.nonceLength),e.from(s).toString("base64")}},{key:"decryptBox",value:function(t,n){if(n.length!==o.box.publicKeyLength)throw new Error("Given encryption public key is invalid.");var a=e.from(t,"base64"),r=new Uint8Array(o.box.nonceLength);a.copy(r,0,0,r.length);var s=new Uint8Array(a.length-o.box.nonceLength);a.copy(s,0,r.length);var i=o.box.open(s,r,n,this._key.secretKey);return e.from(i).toString()}},{key:"encryptBox",value:function(t,n){if(n.length!==o.box.publicKeyLength)throw new Error("Given encryption public key is invalid.");var a=e.from(t),r=o.randomBytes(o.box.nonceLength),s=o.box(a,r,n,this._key.secretKey),i=new Uint8Array(s.length+o.box.nonceLength);return i.set(r),i.set(s,o.box.nonceLength),e.from(i).toString("base64")}},{key:"get",value:function(e,t){var n;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return t=Object.assign({encrypted:!1,appId:this.appId},t),a.next=3,r.a.awrap(this._contract.get({app_id:t.appId,key:e}));case 3:return(n=a.sent)&&(n=JSON.parse(t.encrypted?this.decryptSecretBox(n):n)),a.abrupt("return",n);case 6:case"end":return a.stop()}}),null,this)}},{key:"getFrom",value:function(e,t,n){var a,s,i;return r.a.async((function(o){for(;;)switch(o.prev=o.next){case 0:return n=Object.assign({encrypted:!1,appId:this.appId},n),a=new c.Account(this._near.connection,e),s=new c.Contract(a,e,{viewMethods:["get"],changeMethods:[],sender:this.accountId}),o.next=5,r.a.awrap(s.get({app_id:n.appId,key:t}));case 5:return(i=o.sent)&&(i=JSON.parse(n.encrypted?this.decryptSecretBox(i):i)),o.abrupt("return",i);case 8:case"end":return o.stop()}}),null,this)}},{key:"apps",value:function(){return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.a.awrap(this._contract.apps());case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),null,this)}},{key:"set",value:function(e,t,n){var a=this;return r.a.async((function(s){for(;;)switch(s.prev=s.next){case 0:return s.next=2,r.a.awrap(this.forceReady());case 2:return n=Object.assign({encrypted:!1},n),s.next=5,r.a.awrap(this.wrappedCall((function(){return a._contract.set({key:e,value:n.encrypted?a.encryptSecretBox(JSON.stringify(t)):JSON.stringify(t)},2e15)})));case 5:case"end":return s.stop()}}),null,this)}},{key:"remove",value:function(e){var t=this;return r.a.async((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,r.a.awrap(this.forceReady());case 2:return n.next=4,r.a.awrap(this.wrappedCall((function(){return t._contract.remove({key:e},2e15)})));case 4:case"end":return n.stop()}}),null,this)}},{key:"pullMessage",value:function(e){var t=this;return r.a.async((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.a.awrap(this.forceReady());case 2:return e.next=4,r.a.awrap(this._contract.num_messages({app_id:this.appId}));case 4:if(e.t0=e.sent,!(e.t0>0)){e.next=11;break}return e.next=8,r.a.awrap(this.wrappedCall((function(){return t._contract.pull_message({},2e15)})));case 8:return e.abrupt("return",e.sent);case 11:return e.abrupt("return",null);case 12:case"end":return e.stop()}}),null,this)}},{key:"getTheirPublicKey",value:function(t){var n,a;return r.a.async((function(s){for(;;)switch(s.prev=s.next){case 0:if(!(t=Object.assign({accountId:null,theirPublicKey:null,theirPublicKey64:null,encryptionKey:l,appId:this.appId},t)).theirPublicKey){s.next=3;break}return s.abrupt("return",t.theirPublicKey);case 3:if(t.theirPublicKey64){s.next=9;break}if(t.accountId){s.next=6;break}throw new Error("Either accountId or theirPublicKey64 has to be provided");case 6:return s.next=8,r.a.awrap(this.getFrom(t.accountId,t.encryptionKey,{appId:t.appId}));case 8:t.theirPublicKey64=s.sent;case 9:if(t.theirPublicKey64){s.next=11;break}throw new Error("Their app doesn't provide the encryption public key.");case 11:if((n=e.from(t.theirPublicKey64,"base64")).length===o.box.publicKeyLength){s.next=14;break}throw new Error("Their encryption public key is invalid.");case 14:return(a=new Uint8Array(o.box.publicKeyLength)).set(n),s.abrupt("return",a);case 17:case"end":return s.stop()}}),null,this)}},{key:"encryptMessage",value:function(e,t){var n;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,r.a.awrap(this.getTheirPublicKey(t));case 2:return n=a.sent,a.abrupt("return",this.encryptBox(e,n));case 4:case"end":return a.stop()}}),null,this)}},{key:"decryptMessage",value:function(e,t){var n;return r.a.async((function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,r.a.awrap(this.getTheirPublicKey(t));case 2:return n=a.sent,a.abrupt("return",this.decryptBox(e,n));case 4:case"end":return a.stop()}}),null,this)}},{key:"sendMessage",value:function(e,t,n){var a=this;return r.a.async((function(s){for(;;)switch(s.prev=s.next){case 0:return this.forceReady(),n=Object.assign({appId:this.appId},n),s.next=4,r.a.awrap(this.wrappedCall((function(){return a._contract.send_message({receiver_id:e,app_id:n.appId,message:t},2e15)})));case 4:case"end":return s.stop()}}),null,this)}}]),t}()}).call(this,n(23).Buffer)},41:function(e,t,n){e.exports=n.p+"static/media/anon.5cbbd243.png"},84:function(e,t,n){e.exports=n.p+"static/media/gray_near_logo.55517b93.svg"},87:function(e,t,n){e.exports=n.p+"static/media/encryptionOn.23e3b306.png"},88:function(e,t,n){e.exports=n.p+"static/media/encryptionOff.475ce496.png"},93:function(e,t,n){!function(){function t(e){switch(e){case"production":case"development":return{networkId:"default",nodeUrl:"https://rpc.nearprotocol.com",contractName:"react-template",walletUrl:"https://wallet.nearprotocol.com"};case"staging":return{networkId:"staging",nodeUrl:"https://staging-rpc.nearprotocol.com/",contractName:"react-template",walletUrl:"https://near-wallet-staging.onrender.com"};case"local":return{networkId:"local",nodeUrl:"http://localhost:3030",keyPath:"".concat(Object({NODE_ENV:"production",PUBLIC_URL:""}).HOME,"/.near/validator_key.json"),walletUrl:"http://localhost:4000/wallet",contractName:"react-template"};case"test":return{networkId:"local",nodeUrl:"http://localhost:3030",contractName:"react-template",masterAccount:"test.near"};case"test-remote":case"ci":return{networkId:"shared-test",nodeUrl:"http://shared-test.nearprotocol.com:3030",contractName:"react-template",masterAccount:"test.near"};case"ci-staging":return{networkId:"shared-test-staging",nodeUrl:"http://staging-shared-test.nearprotocol.com:3030",contractName:"react-template",masterAccount:"test.near"};default:throw Error("Unconfigured environment '".concat(e,"'. Can be configured in src/config.js."))}}var a=n(167),r="undefined"!=typeof a&&a.getJSON("fiddleConfig");e.exports?e.exports=t:window.nearConfig=r&&r.nearPages?r:t("development")}()},95:function(e,t,n){e.exports=n(168)}},[[95,1,2]]]);
//# sourceMappingURL=main.35a381af.chunk.js.map