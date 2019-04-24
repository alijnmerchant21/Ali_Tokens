var AliToken = artifacts.require("./AliToken.sol");

contract('AliToken', function(accounts) {
	var tokenInstance;

  it('initializes the contract with correct value', function(){

  	return AliToken.deployed().then(function(instance){
  		tokenInstance = instance;
  		return tokenInstance.name();
  	}).then(function(name){
  		assert.equal(name, 'AliToken', 'Has correct name');
  		return tokenInstance.symbol(); 
  	}).then(function(symbol){
  		assert.equal(symbol, 'Ali', 'Has correct symbol');
  		return tokenInstance.standard();
  	}).then(function(standard){
  		assert.equal(standard, 'AliToken 1.2.2', 'Has correct standard ');
  	})

  })

  it('sets the initial supply upon deployment', function() {
    return AliToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(function(totalSupply) {
      assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');

      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance){
    	assert.equal(adminBalance.toNumber(), 1000000, 'It allocates the initial supply to admin.')
    }); 
  });


it('transfers token ownership', function(){

	return AliToken.deployed().then(function(instance){
	tokenInstance = instance;
	return tokenInstance.transfer.call(accounts[1], 2200000000000000000000000000);
	}).then(assert.fail).catch(function(error){
		assert(error.message.indexOf('revert') >=0, 'Error message must contain revert');
		return tokenInstance.transfer.call(accounts[1], 25000, {from: accounts[0]});
	}).then(function(success){
		assert.equal(success, true, 'It returns true');
		return tokenInstance.transfer(accounts[1], 25000, {from: accounts[0]});
	}).then(function(reciept){
		assert.equal(reciept.logs.length, 1, 'triggers one  event');
		assert.equal(reciept.logs[0].event, 'Transfer', 'Should be a "Transfer" event');
		assert.equal(reciept.logs[0].args._from, accounts[0], 'logs the account the token are transfered from');
		assert.equal(reciept.logs[0].args._to, accounts[1], 'logs the account the token are transfered to');
		assert.equal(reciept.logs[0].args._value, 25000, 'logs the transfer amount');
		return tokenInstance.balanceOf(accounts[1]);
	}).then(function(balance){
		assert.equal(balance.toNumber(), 25000, 'Add account of recieving account');
		return tokenInstance.balanceOf(accounts[0]);
	}).then(function(balance){
		assert.equal(balance.toNumber(), 975000, 'Deducts the amount from senders acoount');
	});
});

it('approves tokens for delegated transfer', function(){
	return AliToken.deployed().then(function(instance){
		tokenInstance = instance;
		return tokenInstance.approve.call(accounts[1], 100)
	}).then(function(success){
		assert.equal(success, true, 'it returns true');
		return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
	}).then(function(reciept){
		assert.equal(reciept.logs.length, 1, 'triggers one  event');
		assert.equal(reciept.logs[0].event, 'Approval', 'Should be a "Approval" event');
		assert.equal(reciept.logs[0].args._owner, accounts[0], 'logs the account the token are authorized from');
		assert.equal(reciept.logs[0].args._spender, accounts[1], 'logs the account the token are authorized to');
		assert.equal(reciept.logs[0].args._value, 100, 'logs the transfer amount'); 
		return tokenInstance.allowance(accounts[0], accounts[1]);
	}).then(function(allowance){
		assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
	});
});

it('handles delegated token transfer', function(){
	return AliToken.deployed().then(function(instance){
		tokenInstance = instance;
		fromAccount = accounts[2];
		toAccount = accounts[3];
		spendingAccount = accounts[4];

		return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
	}).then(function(reciept){
		return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
	}).then(function(reciept){
		return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendingAccount});
	}).then(assert.fail).catch(function(error){
		assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
		return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
	}).then(assert.fail).catch(function(error){
		assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
		return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(success){
			assert.equal(success, true);
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(reciept){
		assert.equal(reciept.logs.length, 1, 'triggers one  event');
		assert.equal(reciept.logs[0].event, 'Transfer', 'Should be a "Transfer" event');
		assert.equal(reciept.logs[0].args._from, fromAccount, 'logs the account the token are transfered from');
		assert.equal(reciept.logs[0].args._to, toAccount, 'logs the account the token are transfered to');
		assert.equal(reciept.logs[0].args._value, 10, 'logs the transfer amount'); 	
		return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90, 'Deducts the amount from sending account');
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 10, 'Adds the amount to recieving account');
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 10, 'deducts the amount from allowance');
		});
});
});

