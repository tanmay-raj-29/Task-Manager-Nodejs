// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-aadhar:dzire8510@cluster0.hdyn0.mongodb.net/todolistDB",{'useNewUrlParser':true,'useUnifiedTopology':true,'useFindAndModify':false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to the todolist!"
});
const item2 = new Item({
  name: "Hit + button to add new items."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){

    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items to database");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName);
        // res.redirect("/:customListName"); can also use this gave the same result
      }else{
        res.render("List",{listTitle: foundList.name,newListItems: foundList.items});
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

  if(listName === "Today"){
  item.save();
  res.redirect("/");
  } else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (!err){
        console.log("Successfully deleted the checked item.");
        res.redirect("/");
      } else{
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItemId}}}, function(err,foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });

  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
// app.listen(port);

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started successfully.");
});
