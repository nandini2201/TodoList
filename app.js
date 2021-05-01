//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require ("lodash"); 
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-nandini:Papa9415@cluster0.jtcs9.mongodb.net/todolistDB",{useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false });
const itemsSchema = {
  name : String
}
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome to your todolist"
});
const item2 = new Item({
  name:"Hit the + icon to add item"
});
const item3 = new Item({
  name:"Check the box to delete the item"
});
const defaultItems = [item1, item2, item3];


// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  
Item.find({}, function(err,foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Data saved successfully to DB");
      }
    });
    res.redirect("/");
  }else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
// const day = date.getDate();
//deleted date.js



});
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
//         //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/", function(req, res){

 const itemName =  req.body.newItem;
 const item = new Item({
   name:itemName
 });
 item.save();
 res.redirect("/");

 
});

app.post("/delete", function(req, res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("Deleted");
      res.redirect("/");
    
      
    }
  
  });
} else {
  List.findOneAndUpdate({name : listName }, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
  })
}
  
  // console.log(req.body.checkbox);
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

let port = process.env.PORT;
if (port == null || port == "") {
}




app.listen(port, function() {
  console.log("Server started sucessfully");
});
