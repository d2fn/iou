function Model() {

  this.people = {};
  this.total = 0.00;
  this.receivers = [];
  this.payers = [];

  this.addPerson = function(person) {
    if (!this.people[person.name]) {
      this.people[person.name] = person;
    }
    else {
      this.people[person.name].paid += person.paid;
    }
    this.total += person.paid;
  };

  this.getPerPersonCost = function() {
    return this.total / Object.size(this.people);
  };

  // commit person list and partition into those
  // who owe money and those who are owed money
  this.commit = function() {
    for (var name in this.people) {
      var person = this.people[name];
      person.notifyOfObligations(this.getPerPersonCost());
      if (person.owed) {
        this.receivers.push(person);
      }
      else if (person.owes) {
        this.payers.push(person);
      }
    }
    this.receivers.sort(sortByAmount);
    this.payers.sort(sortByAmount);
  };

  this.hasPayments = function() {
    return this.receivers.length > 0 && this.payers.length > 0;
  };

  this.popPayer = function() {
    return this.payers.pop();
  };

  this.popReceiver = function() {
    return this.receivers.pop();
  };

  function sortByAmount(a, b) {
    return (a.getAbsDelta() < b.getAbsDelta()) ? -1 : ((a.getAbsDelta() > b.getAbsDelta()) ? 1 : 0)
  }
}

function Person(name, paid) {

  this.name = name;
  this.paid = paid;
  this.delta = 0.00;

  this.owes = false;
  this.owed = false;

  // prepare the div that will hold the information about this person
  $("#corrections").append("<div id=\"" + this.name + "\" class=\"personblock\"></div>");
  this.div = $("#corrections #" + this.name).empty();
  this.div.append("<p class=\"name\">" + this.name + "</p>");

  // notify person of obligations and report amount they owe or are owed
  this.notifyOfObligations = function (perPersonCost) {

    this.delta = paid - perPersonCost;

    if (this.delta > 0) {
      this.div.append("<p class=\"personblock\">" + this.name + " spent <span class=\"amount\">" + curr(this.paid) + "</span> and is owed <span class=\"payment amount\">" + curr(this.delta) + "</span></p>");
      this.owed = true;
    }
    else if (this.delta < 0) {
      this.div.append("<p class=\"personblock\">" + this.name + " spent <span class=\"amount\">" + curr(this.paid) + "</span> and owes <span class=\"debt amount\">" + curr(-this.delta) + "</span></p>");
      this.owes = true;
    }
    else {
      this.div.append("<p class=\"personblock\">" + this.name + " spent <span class=\"amount\">" + curr(this.paid) + "</span> which is just the right amount</p>")
    }
  };

  this.getAmountToPay = function() {
    return -this.delta;
  };

  this.getAmountToReceive = function() {
    return this.delta;
  };

  this.getAbsDelta = function() {
    return Math.abs(this.delta);
  };

  this.pay = function(receiver) {
    var amountPaid = 0.00;
    var change = this.getAmountToPay() - receiver.getAmountToReceive();
    if (change > 0) {
      amountPaid = receiver.getAmountToReceive();
      // I have more than this person requires.  Pay them off and keep the change
      receiver.delta = 0;
      this.delta = -change;
    }
    else if (change < 0) {
      amountPaid = this.getAmountToPay();
      // I don't have owe to pay off this person, give all I have and process change
      this.delta = 0;
      receiver.delta = -change;
    }
    else {
      amountPaid = this.getAmountToPay();
      // my debt matches this person's owed amount and they cancel eachother out
      receiver.delta = 0;
      this.delta = 0;
    }
    return amountPaid;
  };
}