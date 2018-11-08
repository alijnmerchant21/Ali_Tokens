 App = {
 web3Provider: null,
 contracts: {},
 account: '0x0',
 loading: false,
 tokenPrice: 100000000000000,
 tokenSold: 0,
 tokensAvailable: 750000,

 init: function() {
	console.log("App initialized...")
	return App.initWeb3();
},

initWeb3: function(){
	if (typeof web3 !== 'undefined') {
       App.web3Provider = web3.currentProvider;
       web3 = new Web3(web3.currentProvider);
	} 
	else {
  // Set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));
        web3 = new Web3(App.Web3Provider);
	}

	return App.initContracts();
	return App.initContracts();
},
	initContracts: function(){
		$.getJSON("AliTokenSale.json", function(aliTokenSale){
			App.contracts.AliTokenSale = TruffleContract(aliTokenSale);
			App.contracts.AliTokenSale.setProvider(App.web3Provider);
			App.contracts.AliTokenSale.deployed().then(function(aliTokenSale) {
			console.log("Ali Token Sale Address:", aliTokenSale.address);
			});
		}).done(function(){	
		$.getJSON("AliToken.json", function(aliToken){
			App.contracts.AliToken = TruffleContract(aliToken);
			App.contracts.AliToken.setProvider(App.web3Provider);
			App.contracts.AliToken.deployed().then(function(aliToken){
			  console.log("Ali Token Address:", aliToken.address);
		    });	 
			App.listenForEvents();
		    return App.render();
		});    
	});
	},

	listenForEvents: function() {
    App.contracts.AliTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },


	render: function(){ 

	if(App.loading) {
		return;
	}

	App.loading = true;
	var loader = $('#loader');
	var content = $('#content');

	loader.show();
	content.hide();

	web3.eth.getCoinbase(function(err, account){
		if(err === null){
			console.log("account", account);
			App.account = account;
			$('#accountAddress').html("Your Account: " + account);
		}
	});
	
	App.contracts.AliTokenSale.deployed().then(function(instance){
		aliTokenSaleInstance = instance;
		return aliTokenSaleInstance.tokenPrice();
	}).then(function(price){
		App.tokenPrice = price;
		$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
		return aliTokenSaleInstance.tokensSold();
	}).then(function(tokenSold){
	   App.tokenSold = tokenSold.toNumber();  
	   $('.token-sold').html(App.tokenSold);
	   $('.token-available').html(App.tokensAvailable);

	   var progressPercent = (App.tokenSold / App.tokensAvailable) * 100;
	   $('#progress').css('width', progressPercent + '%');
	}); 

	App.contracts.AliToken.deployed().then(function(instance){
		aliTokenInstance = instance;
		return aliTokenInstance.balanceOf(App.account);
	}).then(function(balance){
		App.tokenBalance = balance;
		$('.Ali-Balance').html( balance.toNumber());
	});
	
	App.loading = false;
	loader.hide();
	content.show();
		
	},	  

buyTokens: function(){
	$('#content').hide();
	$ ('#loader').show();
	var numberOfTokens =  $('#numberOfTokens').val();
	App.contracts.AliTokenSale.deployed().then(function(instance) {
		return instance.buyTokens(numberOfTokens, {
		from: App.account, 
		value: numberOfTokens * App.tokenPrice, 
		gas: 5000000 
	});

	}).then(function(result) {
		console.log("Tokens bought... ");
		$('form').trigger('reset')
		$('#loader').hide();
		$('#content').show();
	});
  }  	
};

$(function() {
  $(window).load(function() {
    App.init();
  })
});