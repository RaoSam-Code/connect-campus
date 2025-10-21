const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  orders: [{
    item: String,
    price: Number
    
  }]
});

const User = mongoose.model('User', userSchema);

if (User){
    console.log("Hey user")
}